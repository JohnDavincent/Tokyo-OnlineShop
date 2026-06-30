package com.tokyo.onlineshop.productservices.service;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.common.dto.PagingResponse;
import com.tokyo.common.exception.BadRequestException;
import com.tokyo.common.exception.ConflictException;
import com.tokyo.common.exception.NotFoundException;
import com.tokyo.common.ProductionStatus;
import com.tokyo.onlineshop.productservices.dto.*;
import com.tokyo.onlineshop.productservices.dto.request.CreateProductRequest;
import com.tokyo.onlineshop.productservices.dto.request.FlashSaleRequest;
import com.tokyo.onlineshop.productservices.dto.response.*;
import com.tokyo.onlineshop.productservices.entity.*;
import com.tokyo.onlineshop.productservices.projection.ProductCardProjection;
import com.tokyo.onlineshop.productservices.repository.*;
import com.tokyo.onlineshop.productservices.specification.ProductFilterSpecification;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImp implements ProductService {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ProductUnitRepository productUnitRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductUnitService productUnitService;
    private final ProductImageService productImageService;

    @Transactional
    @Override
    public BaseResponse createProduct(CreateProductRequest request) {
        if(request == null){
            throw new BadRequestException("Field must be fill!!");
        }
        if(productRepository.existsByName(request.getName())){
            throw new ConflictException("Product Already Exists!");
        }
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

        Brand existBrand = brandRepository.findById(request.getBrand()).orElseThrow(() -> new NotFoundException("No brand found"));
        existBrand.addProduct(createProduct);
        createProduct.setBrand(existBrand);

        Category category = categoryRepository.findById(request.getCategory()).orElseThrow(() -> new NotFoundException("No category found"));
        List<String> subCategoryList = categoryRepository.getSubCategoryList(category.getId());


        boolean exists = subCategoryList.stream()
                .anyMatch(sub -> sub.equals(request.getSubCategory()));

        if(exists){
            Category setCategory = categoryRepository.findByParentIdAndName(request.getCategory(),request.getSubCategory());
            createProduct.setCategory(setCategory);
            setCategory.addProduct(createProduct);
        }else{
            throw new NotFoundException("Sub category not found");
        }

        productRepository.save(createProduct);

        //product Unit
        productUnitService.createUnit(createProduct.getId(),request.getUnitList());

        //product image
        productImageService.addImage(createProduct.getId(),request.getImageList());

        CreateProductResponse data = CreateProductResponse.builder()
                .name(createProduct.getName())
                .description(createProduct.getDescription())
                .brand(existBrand.getName())
                .category(category.getName())
                .subCategory(createProduct.getCategory().getName())
                .baseWeight(createProduct.getBaseWeightUnit())
                .stock(createProduct.getStock())
                .build();

        return BaseResponse.builder()
                .status(HttpStatus.CREATED.value())
                .code(HttpStatus.CREATED)
                .message("Product created successfully")
                .data(data)
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
                                        .discountPrice(u.isOnFlashSale() ? u.getFlashSalePrice() : null)
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

    @Transactional
    @Override
    public BaseResponse markProductAsFlashSale(UUID productId, FlashSaleRequest request) {
        if (productId == null) {
            throw new BadRequestException("Product ID is required");
        }
        if (request == null || request.getUnitsSale() == null || request.getUnitsSale().isEmpty()) {
            throw new BadRequestException("At least one unit must be provided for flash sale");
        }
        if (request.getFlashSaleUntil() == null) {
            throw new BadRequestException("Flash sale expiry is required");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        List<UnitCard> flashSaleUnits = new ArrayList<>();

        for (FlashSaleRequest.ProductFlashSaleDto unitSale : request.getUnitsSale()) {
            ProductUnit existUnit = productUnitRepository
                    .findByProduct_IdAndUnit(productId, unitSale.getUnit())
                    .orElseThrow(() -> new NotFoundException(
                            "Unit %s not found for product %s".formatted(unitSale.getUnit(), productId)));

            BigDecimal discountPrice = unitSale.getDiscountPrice();
            if (discountPrice == null
                    || discountPrice.compareTo(BigDecimal.ZERO) <= 0
                    || discountPrice.compareTo(existUnit.getUnitSellPrice()) >= 0) {
                throw new BadRequestException(
                        "Discount price for unit %s must be greater than 0 and less than the sell price"
                                .formatted(unitSale.getUnit()));
            }

            existUnit.setFlashSalePrice(discountPrice);
            existUnit.setFlashSaleUntil(request.getFlashSaleUntil());
            productUnitRepository.save(existUnit);

            flashSaleUnits.add(UnitCard.builder()
                    .unit(existUnit.getUnit())
                    .convertQuantity(existUnit.getConvertQuantity())
                    .sellPrice(existUnit.getUnitSellPrice())
                    .discountPrice(discountPrice)
                    .status(existUnit.getStatus())
                    .build());
        }

        Map<String, Object> data = new HashMap<>();
        data.put("productId", product.getId());
        data.put("productName", product.getName());
        data.put("flashSaleUntil", request.getFlashSaleUntil());
        data.put("units", flashSaleUnits);

        return BaseResponse.builder()
                .status(HttpStatus.OK.value())
                .code(HttpStatus.OK)
                .message("Product units marked as FLASH_SALE successfully")
                .data(data)
                .build();
    }

    @Transactional
    @Override
    public BaseResponse endFlashSale(UUID id) {
        if (id == null) {
            throw new BadRequestException("Product ID is required");
        }

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        List<ProductUnit> activeUnits = productUnitRepository.findByProduct_Id(id).stream()
                .filter(unit -> unit.getFlashSalePrice() != null || unit.getFlashSaleUntil() != null)
                .toList();

        if (activeUnits.isEmpty()) {
            throw new BadRequestException("Product has no unit on flash sale");
        }

        for (ProductUnit unit : activeUnits) {
            unit.setFlashSalePrice(null);
            unit.setFlashSaleUntil(null);
        }
        productUnitRepository.saveAll(activeUnits);

        Map<String, Object> data = new HashMap<>();
        data.put("productId", product.getId());
        data.put("clearedUnitCount", activeUnits.size());

        return BaseResponse.builder()
                .status(HttpStatus.OK.value())
                .code(HttpStatus.OK)
                .message("Flash sale ended successfully")
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
                                        .discountPrice(unit.isOnFlashSale() ? unit.getFlashSalePrice() : null)
                                        .status(unit.getStatus())
                                        .build())
                                .toList()
                )
                .build();
    }

}
