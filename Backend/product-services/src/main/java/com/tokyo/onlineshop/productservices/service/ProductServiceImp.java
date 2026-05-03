package com.tokyo.onlineshop.productservices.service;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.common.dto.PagingResponse;
import com.tokyo.onlineshop.productservices.ProductionStatus;
import com.tokyo.onlineshop.productservices.dto.*;
import com.tokyo.onlineshop.productservices.entity.Brand;
import com.tokyo.onlineshop.productservices.entity.Category;
import com.tokyo.onlineshop.productservices.entity.Product;
import com.tokyo.onlineshop.productservices.entity.ProductUnit;
import com.tokyo.onlineshop.productservices.projection.ProductCardProjection;
import com.tokyo.onlineshop.productservices.repository.BrandRepository;
import com.tokyo.onlineshop.productservices.repository.CategoryRepository;
import com.tokyo.onlineshop.productservices.repository.ProductRepository;
import com.tokyo.onlineshop.productservices.repository.ProductUnitRepository;
import com.tokyo.onlineshop.productservices.specification.ProductFilterSpecification;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImp implements ProductService {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ProductUnitRepository productUnitRepository;
    private final ProductUnitService productUnitService;
    private final ProductImageService productImageService;

    @Transactional
    @Override
    public BaseResponse createProduct(CreateProductRequest request) {
        if(request == null){
            throw new RuntimeException("Field must be fill!!");
        }
        if(productRepository.existsByName(request.getName())){
            throw new RuntimeException("Product Already Exists!");
        }
        Product createProduct = Product.builder()
                .name(request.getName())
                .baseUnit("Pcs")
                .sku(request.getSku())
                .baseWeightUnit(request.getBaseWeight())
                .stock(request.getStock())
                .description(request.getDescription())
                .status(ProductionStatus.AVAILABLE)
                .isFeaturedPage(false)
                .productUnitList(new ArrayList<>())
                .build();

        Brand existBrand = brandRepository.findById(request.getBrand()).orElseThrow(() -> new RuntimeException("No brand found"));
        existBrand.addProduct(createProduct);
        createProduct.setBrand(existBrand);

        Category category = categoryRepository.findById(request.getCategory()).orElseThrow(() -> new RuntimeException("No category found"));
        List<String> subCategoryList = categoryRepository.getSubCategoryList(category.getId());


        boolean exists = subCategoryList.stream()
                .anyMatch(sub -> sub.equals(request.getSubCategory()));

        if(exists){
            Category setCategory = categoryRepository.findByParentIdAndName(request.getCategory(),request.getSubCategory());
            createProduct.setCategory(setCategory);
            setCategory.addProduct(createProduct);
        }else{
            throw new RuntimeException("Sub category not found");
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
            throw new RuntimeException("There is no product that is featuredPage");
        }

        List<ProductCard> data = productList.stream()
                .map(card -> {
                    return ProductCard.builder()
                            .productId(card.getId())
                            .productName(card.getName())
                            .url(card.getProductImageList().getFirst().getUrl())
                            .altText(card.getProductImageList().getFirst().getUrl())
                            .status(card.getStatus())
                            .category(card.getCategory().getName())
                            .unitList(
                                    card.getProductUnitList().stream()
                                            .map(unit -> {
                                                    return UnitCard.builder()
                                                            .unit(unit.getUnit())
                                                            .convertQuantity(unit.getConvertQuantity())
                                                            .sellPrice(unit.getUnitSellPrice())
                                                            .status(unit.getStatus())
                                                            .build();
                                                    }
                                            ).toList()
                            )
                            .build();
                }).toList();

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
            throw new RuntimeException("There is no product that is featuredPage");
        }

        List<ProductCard> data = productList.stream()
                .map(card -> {
                    return ProductCard.builder()
                            .productId(card.getId())
                            .productName(card.getName())
                            .url(card.getProductImageList().getFirst().getUrl())
                            .altText(card.getProductImageList().getFirst().getUrl())
                            .status(card.getStatus())
                            .category(card.getCategory().getName())
                            .unitList(
                                    card.getProductUnitList().stream()
                                            .map(unit -> {
                                                        return UnitCard.builder()
                                                                .unit(unit.getUnit())
                                                                .convertQuantity(unit.getConvertQuantity())
                                                                .sellPrice(unit.getUnitSellPrice())
                                                                .status(unit.getStatus())
                                                                .build();
                                                    }
                                            ).toList()
                            )
                            .build();
                }).toList();

        return BaseResponse.builder()
                .status(HttpStatus.OK.value())
                .code(HttpStatus.OK)
                .message("Arrival products retrieved successfully")
                .data(data)
                .build();
    }

    @Override
    public BaseResponse getProductDetail(UUID id) {
        Product existProduct = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product Not Found!!"));
        Brand productBrand = brandRepository.findById(existProduct.getBrand().getId()).orElseThrow(() -> new RuntimeException("Brand is not found"));
        Category productSubCategory = categoryRepository.findById(existProduct.getCategory().getId()).orElseThrow(() -> new RuntimeException("Category not found"));
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
            throw new RuntimeException("Category not exists");
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
                .map(product -> ProductCard.builder()
                        .productId(product.getId())
                        .productName(product.getName())
                        .url(product.getProductImageList().isEmpty() ? "" : product.getProductImageList().getFirst().getUrl())
                        .altText(product.getProductImageList().isEmpty() ? "" : product.getProductImageList().getFirst().getUrl())
                        .status(product.getStatus())
                        .category(product.getCategory() != null ? product.getCategory().getName() : "")
                        .unitList(
                                product.getProductUnitList().stream()
                                        .map(unit -> UnitCard.builder()
                                                .unit(unit.getUnit())
                                                .convertQuantity(unit.getConvertQuantity())
                                                .sellPrice(unit.getUnitSellPrice())
                                                .status(unit.getStatus())
                                                .build()
                                        ).toList()
                        )
                        .build()
                ).toList();

        PagingResponse pagingData = new PagingResponse(productCards, result.getTotalPages(), result.getTotalElements(), result.getNumber() + 1, result.getSize());

        return BaseResponse.builder()
                .status(HttpStatus.OK.value())
                .code(HttpStatus.OK)
                .message("Products retrieved successfully")
                .data(pagingData)
                .build();
    }


}
