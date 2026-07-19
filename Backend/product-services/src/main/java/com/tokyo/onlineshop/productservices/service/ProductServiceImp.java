package com.tokyo.onlineshop.productservices.service;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.common.dto.PagingResponse;
import com.tokyo.common.exception.BadRequestException;
import com.tokyo.common.exception.ConflictException;
import com.tokyo.common.exception.NotFoundException;
import com.tokyo.common.ProductionStatus;
import com.tokyo.onlineshop.productservices.dto.*;
import com.tokyo.onlineshop.productservices.dto.request.*;
import com.tokyo.onlineshop.productservices.dto.response.*;
import com.tokyo.onlineshop.productservices.entity.*;
import com.tokyo.onlineshop.productservices.enums.FlashSaleStatus;
import com.tokyo.onlineshop.productservices.projection.ProductCardProjection;
import com.tokyo.onlineshop.productservices.repository.*;
import com.tokyo.onlineshop.productservices.specification.ProductFilterSpecification;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImp implements ProductService {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final ProductFlashSaleRepository productFlashSaleRepository;
    private final CategoryRepository categoryRepository;
    private final ProductUnitRepository productUnitRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductUnitService productUnitService;
    private final ProductImageService productImageService;

    @Transactional
    @Override
    public BaseResponse createProduct(CreateProductRequest request, List<MultipartFile> images) {
        ValidatedProductRequest validated = validateProductRequest(request, images, null);

        Product createProduct = Product.builder()
                .name(request.getName())
                .baseUnit("Pcs")
                .sku(request.getSku())
                .baseWeightUnit(request.getBaseWeight())
                .stock(request.getStock())
                .description(request.getDescription())
                .status(ProductionStatus.AVAILABLE)
                .totalSold(0L)
                .isFeaturedPage(false)
                .productUnitList(new ArrayList<>())
                .newMarkedAt(LocalDateTime.now())
                .build();

        validated.brand().addProduct(createProduct);
        createProduct.setBrand(validated.brand());

        createProduct.setCategory(validated.subCategory());
        validated.subCategory().addProduct(createProduct);

        productRepository.save(createProduct);

        productUnitService.createUnit(createProduct.getId(), request.getUnitList());
        productImageService.saveImages(createProduct, images, request.getAltTexts());

        return BaseResponse.builder()
                .status(HttpStatus.CREATED.value())
                .code(HttpStatus.CREATED)
                .message("Product created successfully")
                .data(buildProductResponse(createProduct, validated))
                .build();
    }

    @Transactional
    @Override
    public BaseResponse updateProduct(UUID id, CreateProductRequest request, List<MultipartFile> images) {
        if (id == null) {
            throw new BadRequestException("Product ID is required");
        }

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        ValidatedProductRequest validated = validateProductRequest(request, images, id);

        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setStock(request.getStock());
        product.setBaseWeightUnit(request.getBaseWeight());
        product.setDescription(request.getDescription());
        product.setBrand(validated.brand());
        product.setCategory(validated.subCategory());

        productRepository.save(product);

        productUnitRepository.deleteByProduct_Id(product.getId());
        productUnitRepository.flush();
        productUnitService.createUnit(product.getId(), request.getUnitList());

        if (images != null && !images.isEmpty()) {
            productImageRepository.deleteByProduct_Id(product.getId());
            productImageRepository.flush();
            productImageService.saveImages(product, images, request.getAltTexts());
        }

        return BaseResponse.builder()
                .status(HttpStatus.OK.value())
                .code(HttpStatus.OK)
                .message("Product updated successfully")
                .data(buildProductResponse(product, validated))
                .build();
    }

    private ValidatedProductRequest validateProductRequest(CreateProductRequest request,
                                                           List<MultipartFile> images,
                                                           UUID excludeProductId) {
        if (request == null) {
            throw new BadRequestException("Request body is required");
        }

        boolean nameTaken = excludeProductId == null
                ? productRepository.existsByName(request.getName())
                : productRepository.existsByNameAndIdNot(request.getName(), excludeProductId);
        if (nameTaken) {
            throw new ConflictException("Product name already exists");
        }

        boolean skuTaken = excludeProductId == null
                ? productRepository.existsBySku(request.getSku())
                : productRepository.existsBySkuAndIdNot(request.getSku(), excludeProductId);
        if (skuTaken) {
            throw new ConflictException("Product SKU already exists");
        }

        if (request.getUnitList() == null || request.getUnitList().isEmpty()) {
            throw new BadRequestException("At least one unit is required");
        }

        if (request.getBrand() == null) {
            throw new BadRequestException("Brand is required");
        }
        Brand brand = brandRepository.findById(request.getBrand())
                .orElseThrow(() -> new NotFoundException("Brand not found"));

        if (request.getCategory() == null) {
            throw new BadRequestException("Category is required");
        }
        Category category = categoryRepository.findById(request.getCategory())
                .orElseThrow(() -> new NotFoundException("Category not found"));

        if (request.getSubCategory() == null || request.getSubCategory().isBlank()) {
            throw new BadRequestException("Sub category is required");
        }
        Category subCategory = categoryRepository.findByParentIdAndName(category.getId(), request.getSubCategory());
        if (subCategory == null) {
            throw new NotFoundException("Sub category not found under the given category");
        }

        if (images != null) {
            for (int i = 0; i < images.size(); i++) {
                MultipartFile file = images.get(i);
                if (file == null || file.isEmpty()) {
                    throw new BadRequestException("Image file at index " + i + " is empty");
                }
            }
            if (request.getAltTexts() != null && request.getAltTexts().size() > images.size()) {
                throw new BadRequestException("altTexts has more entries than uploaded images");
            }
        }

        return new ValidatedProductRequest(brand, category, subCategory);
    }

    private CreateProductResponse buildProductResponse(Product product, ValidatedProductRequest validated) {
        return CreateProductResponse.builder()
                .name(product.getName())
                .sku(product.getSku())
                .stock(product.getStock())
                .baseWeight(product.getBaseWeightUnit())
                .brand(validated.brand().getName())
                .category(validated.category().getName())
                .subCategory(validated.subCategory().getName())
                .description(product.getDescription())
                .build();
    }

    private record ValidatedProductRequest(Brand brand, Category category, Category subCategory) {}

    @Transactional
    @Override
    public BaseResponse incrementTotalSold(List<IncrementSoldRequest> request) {
        if (request == null || request.isEmpty()) {
            throw new BadRequestException("At least one item is required");
        }

        for (IncrementSoldRequest item : request) {
            if (item == null || item.getProductId() == null) {
                throw new BadRequestException("productId is required for every item");
            }
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new BadRequestException("quantity must be positive for every item");
            }
        }

        for (IncrementSoldRequest item : request) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new NotFoundException("Product %s not found".formatted(item.getProductId())));
            long current = product.getTotalSold() == null ? 0L : product.getTotalSold();
            product.setTotalSold(current + item.getQuantity());
            productRepository.save(product);
        }

        return BaseResponse.builder()
                .status(HttpStatus.OK.value())
                .code(HttpStatus.OK)
                .message("Total sold updated for %d product(s)".formatted(request.size()))
                .data(request.size())
                .build();
    }

    @Override
    public BaseResponse getProductListFeatured() {
        List<Product> productList = productRepository.listOfFeaturedPageProduct();
        if(productList.isEmpty()){
            throw new NotFoundException("There is no product that is featuredPage");
        }

        List<ProductCard> data = productList.stream()
                .map(this::mapToProductCard)
                .toList();

        return BaseResponse.builder()
                .status(HttpStatus.OK.value())
                .code(HttpStatus.OK)
                .message("Featured products retrieved successfully")
                .data(data)
                .build();
    }

    @Override
    public BaseResponse getLastArrivalProductList() {
        List<Product> productList = productRepository.listOfArrivalProduct();
        if(productList.isEmpty()){
            throw new NotFoundException("There is no product that is featuredPage");
        }

        List<ProductCard> data = productList.stream()
                .map(this::mapToProductCard)
                .toList();

        return BaseResponse.builder()
                .status(HttpStatus.OK.value())
                .code(HttpStatus.OK)
                .message("Arrival products retrieved successfully")
                .data(data)
                .build();
    }

    @Override
    public BaseResponse getProductDetail(UUID id) {
        Product existProduct = productRepository.findById(id).orElseThrow(() -> new NotFoundException("Product Not Found!!"));
        Brand productBrand = brandRepository.findById(existProduct.getBrand().getId()).orElseThrow(() -> new NotFoundException("Brand is not found"));
        Category productSubCategory = categoryRepository.findById(existProduct.getCategory().getId()).orElseThrow(() -> new NotFoundException("Category not found"));
        Category productCategory = categoryRepository.findByParentIdAndName(productSubCategory.getParentId(),productSubCategory.getName());

        GetProductDetailResponse data = GetProductDetailResponse.builder()
                .id(existProduct.getId())
                .name(existProduct.getName())
                .sku(existProduct.getSku())
                .description(existProduct.getDescription())
                .baseWeight(existProduct.getBaseWeightUnit())
                .status(existProduct.getStatus())
                .category(productCategory.getName())
                .subCategory(productSubCategory.getName())
                .brand(productBrand.getName())
                .unitList(existProduct.getProductUnitList().stream().map(
                        unit -> CreateUnitResponse.builder()
                                .id(unit.getId())
                                .unit(unit.getUnit())
                                .basePrice(unit.getUnitBasePrice())
                                .sellPrice(unit.getUnitSellPrice())
                                .convertUnit(unit.getQuantityUnit())
                                .build()
                ).toList())
                .imageList(existProduct.getProductImageList().stream().map(
                        image -> CreateImageResponse.builder()
                                .url(image.getUrl())
                                .altText(image.getUrl())
                                .isPrimary(image.getIsPrimary())
                                .build()
                ).toList())
                .build();

        return BaseResponse.builder()
                .status(HttpStatus.OK.value())
                .code(HttpStatus.OK)
                .message("Product detail retrieved successfully")
                .data(data)
                .build();
    }

    @Override
    public BaseResponse getProductByCategory(UUID categoryId, int page, int size) {
        if(!categoryRepository.existsById(categoryId)){
            throw new NotFoundException("Category not exists");
        }

        Pageable pageable = PageRequest.of(page,size);
        Page<ProductCardProjection> productList = productRepository.getProductWithCategoryId(categoryId,pageable);
        List<UUID> productIds = productList.getContent().stream()
                .map(ProductCardProjection::getProductId)
                .toList();

        List<ProductUnit> units = productUnitRepository.findByProductIdIn(productIds);
        Map<UUID, List<UnitCard>> productUnits = units.stream()
                .collect(Collectors.groupingBy(
                        u -> u.getProduct().getId(),
                        Collectors.mapping(
                                u -> UnitCard.builder()
                                        .unit(u.getUnit())
                                        .sellPrice(u.getUnitSellPrice())
                                        .convertQuantity(u.getConvertQuantity())
                                        .status(u.getStatus())
                                        .build(), Collectors.toList())
                ));

        List<ProductCard> productCards = productList.stream()
                            .map(product -> ProductCard.builder()
                                    .productId(product.getProductId())
                                    .productName(product.getProductName())
                                    .status(product.getProductStatus())
                                    .url(product.getImageUrl())
                                    .category(product.getCategoryName())
                                    .isHot(product.getIsHot())
                                    .unitList(productUnits.getOrDefault(product.getProductId(),List.of()))
                                    .build()
                            ).toList();

        PagingResponse pagingData = new PagingResponse(productCards, productList.getTotalPages(), productList.getTotalElements(), productList.getNumber() + 1, productList.getSize());

        return BaseResponse.builder()
                .status(HttpStatus.OK.value())
                .code(HttpStatus.OK)
                .message("Products retrieved successfully")
                .data(pagingData)
                .build();
    }

    @Override
    public BaseResponse getProductList(RequestProductListDto request) {
        Sort sort = Sort.by(Sort.Direction.fromString(request.getSortOrder()),request.getSortBy());
        Specification<Product> spec = (root, query, cb) -> cb.conjunction();

        if(request.getRequestDto() != null && request.getRequestDto().getCategoryParentId() != null){
            spec = spec.and(ProductFilterSpecification.hasMainCategory(request.getRequestDto().getCategoryParentId()));
        }

        if(request.getRequestDto() != null && request.getRequestDto().getSubCategoryId() != null){
            spec = spec.and(ProductFilterSpecification.hasSubCategory(request.getRequestDto().getSubCategoryId()));
        }

        if(request.getRequestDto() != null && request.getRequestDto().getSearch() != null){
            spec = spec.and(ProductFilterSpecification.hasSearch(request.getRequestDto().getSearch()));
        }

        Page<Product> result = productRepository.findAll(spec,PageRequest.of(request.getCurrentPage(),request.getPageSize(),sort));

        List<ProductCard> productCards = result.getContent().stream()
                .map(this::mapToProductCard)
                .toList();

        PagingResponse pagingData = new PagingResponse(productCards, result.getTotalPages(), result.getTotalElements(), result.getNumber() + 1, result.getSize());

        return BaseResponse.builder()
                .status(HttpStatus.OK.value())
                .code(HttpStatus.OK)
                .message("Products retrieved successfully")
                .data(pagingData)
                .build();
    }

//    @Override
//    public BaseResponse getProductSaleList(FlashSaleListRequest request) {
//        Sort sort = Sort.by(Sort.Direction.fromString(request.getSort()),request.getSortBy());
//        Specification<ProductUnit> spec = Specification.where(ProductUnitSpecification.isProductOnSale());
//
//        if(request.getSearch() != null){
//
//        }
//
//    }

    @Transactional
    @Override
    public BaseResponse getTopSoldProducts() {
        List<Product> productList = productRepository.findTop10ByTotalSold();
        if (productList.isEmpty()) {
            throw new NotFoundException("No products found");
        }

        productRepository.clearTopSoldHotFlags();

        List<UUID> topIds = productList.stream()
                .map(Product::getId)
                .toList();
        if (!topIds.isEmpty()) {
            productRepository.setTopSoldHotFlags(topIds);
        }

        productList.forEach(product -> product.setIsHot(true));

        List<ProductCard> data = productList.stream()
                .map(this::mapToProductCard)
                .toList();

        return BaseResponse.builder()
                .status(HttpStatus.OK.value())
                .code(HttpStatus.OK)
                .message("Top sold products retrieved successfully")
                .data(data)
                .build();
    }

    @Override
    public BaseResponse getNewProducts() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(7);
        List<Product> productList = productRepository.findActiveNewProducts(ProductionStatus.NEW, cutoff);
        if (productList.isEmpty()) {
            throw new NotFoundException("No new products found");
        }

        List<ProductCard> data = productList.stream()
                .map(this::mapToProductCard)
                .toList();

        return BaseResponse.builder()
                .status(HttpStatus.OK.value())
                .code(HttpStatus.OK)
                .message("New products retrieved successfully")
                .data(data)
                .build();
    }

    @Transactional
    @Override
    public BaseResponse markProductAsNew(UUID id) {
        if (id == null) {
            throw new BadRequestException("Product ID is required");
        }

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        product.setStatus(ProductionStatus.NEW);
        product.setNewMarkedAt(LocalDateTime.now());
        productRepository.save(product);

        Map<String, Object> data = new HashMap<>();
        data.put("productId", product.getId());
        data.put("status", product.getStatus());
        data.put("newMarkedAt", product.getNewMarkedAt());

        return BaseResponse.builder()
                .status(HttpStatus.OK.value())
                .code(HttpStatus.OK)
                .message("Product marked as NEW successfully")
                .data(data)
                .build();
    }

    @Override
    public GetProductClientResponse getProduct(UUID id) {
        Product product = productRepository.findById(id).orElseThrow(() -> new NotFoundException("product with id : " + id + " not found"));
        String image = productImageRepository.getUrl(product.getId());
        return GetProductClientResponse.builder()
                .productId(product.getId())
                .productName(product.getName())
                .status(product.getStatus())
                .url(image)
                .build();
    }

    @Override
    public List<GetProductClientResponse> getProductListByIds(List<UUID> ids) {
        return productRepository.findAllByIdWithImages(ids).stream()
                .map(product -> GetProductClientResponse.builder()
                        .productId(product.getId())
                        .productName(product.getName())
                        .status(product.getStatus())
                        .url(product.getProductImageList().isEmpty() ? "" : product.getProductImageList().getFirst().getUrl())
                        .build())
                .toList();
    }

    @Transactional
    @Override
    public BaseResponse addFlashSaleProduct(UUID productId, FlashSaleRequest request) {
        if (request == null || request.getRequests() == null || request.getRequests().isEmpty()) {
            throw new BadRequestException("Request must not be empty");
        }

        Set<UUID> seenUnitIds = new HashSet<>();
        for (ListFlashSaleRequest item : request.getRequests()) {
            if (item.getUnitId() == null) {
                throw new BadRequestException("unitId is required for every flash sale entry");
            }
            if (!seenUnitIds.add(item.getUnitId())) {
                throw new BadRequestException("Duplicate unitId in request: %s".formatted(item.getUnitId()));
            }
            if (item.getFlashSalePrice() == null
                    || item.getFlashSalePrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Flash sale price must be greater than zero for unit %s"
                        .formatted(item.getUnitId()));
            }
            if (item.getFlashSaleEndDate() == null) {
                throw new BadRequestException("End date is required for unit %s".formatted(item.getUnitId()));
            }
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product %s not found".formatted(productId)));

        Map<UUID, ProductUnit> unitHashMap = productUnitRepository.findByProduct_Id(productId).stream()
                .collect(Collectors.toMap(ProductUnit::getId, Function.identity()));

        LocalDateTime now = LocalDateTime.now();
        List<ProductFlashSale> flashSales = new ArrayList<>();
        List<FlashSaleResponse.UnitResponse> units = new ArrayList<>();
        boolean anyActive = false;

        for (ListFlashSaleRequest item : request.getRequests()) {
            ProductUnit unit = unitHashMap.get(item.getUnitId());
            if (unit == null) {
                throw new BadRequestException("Unit %s does not belong to product %s"
                        .formatted(item.getUnitId(), productId));
            }

            if (item.getFlashSalePrice().compareTo(unit.getUnitSellPrice()) >= 0) {
                throw new BadRequestException("Flash sale price must be lower than the sell price for unit %s"
                        .formatted(unit.getUnit()));
            }

            if (productFlashSaleRepository.existsByProductUnit_Id(unit.getId())) {
                throw new ConflictException("Unit %s already has a flash sale".formatted(unit.getUnit()));
            }

            LocalDateTime startTime = item.getFlashSaleStart() != null
                    ? item.getFlashSaleStart()
                    : now;
            if (!startTime.isBefore(item.getFlashSaleEndDate())) {
                throw new BadRequestException("Start date must be earlier than the end date for unit %s"
                        .formatted(unit.getUnit()));
            }

            FlashSaleStatus status = startTime.isAfter(now)
                    ? FlashSaleStatus.SCHEDULED
                    : FlashSaleStatus.ACTIVE;
            anyActive |= status == FlashSaleStatus.ACTIVE;

            ProductFlashSale flashSaleProduct = ProductFlashSale.builder()
                    .productUnit(unit)
                    .flashSalePrice(item.getFlashSalePrice())
                    .startFlashSaleDate(startTime)
                    .EndFlashSaleDate(item.getFlashSaleEndDate())
                    .status(status)
                    .build();

            flashSales.add(flashSaleProduct);
            units.add(FlashSaleResponse.UnitResponse.builder()
                    .unit(unit.getUnit())
                    .flashSaleStart(startTime)
                    .flashSaleUntil(item.getFlashSaleEndDate())
                    .status(status)
                    .flashSalePrice(item.getFlashSalePrice())
                    .originalPrice(unit.getUnitSellPrice())
                    .build());
        }

        productFlashSaleRepository.saveAll(flashSales);

        FlashSaleResponse response = FlashSaleResponse.builder()
                .productName(product.getName())
                .isFlashSale(anyActive)
                .units(units)
                .build();

        return BaseResponse.builder()
                .message("Flash sale successfully created for %d unit(s)".formatted(flashSales.size()))
                .code(HttpStatus.CREATED)
                .status(HttpStatus.CREATED.value())
                .data(response)
                .build();
    }

    @Override
    public BaseResponse flashSaleList(FlashSaleListRequest request) {
        Sort sort = Sort.by(Sort.Direction.fromString(request.getSort()),request.getSortBy());

    }

    private ProductCard mapToProductCard(Product product) {
        String imageUrl = product.getProductImageList().isEmpty() ? "" : product.getProductImageList().getFirst().getUrl();
        return ProductCard.builder()
                .productId(product.getId())
                .productName(product.getName())
                .url(imageUrl)
                .altText(imageUrl)
                .status(product.getStatus())
                .category(product.getCategory() != null ? product.getCategory().getName() : "")
                .isHot(product.getIsHot())
                .unitList(
                        product.getProductUnitList().stream()
                                .map(unit -> UnitCard.builder()
                                        .unit(unit.getUnit())
                                        .convertQuantity(unit.getConvertQuantity())
                                        .sellPrice(unit.getUnitSellPrice())
                                        .status(unit.getStatus())
                                        .build())
                                .toList()
                )
                .build();
    }

}
