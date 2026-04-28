package com.tokyo.onlineshop.productservices.service;

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
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collector;
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
    public CreateProductResponse createProduct(CreateProductRequest request) {
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
        List<CreateUnitResponse> unitDto = productUnitService.createUnit(createProduct.getId(),request.getUnitList());

        //product image
        List<CreateImageResponse> imageDto = productImageService.addImage(createProduct.getId(),request.getImageList());

        return CreateProductResponse.builder()
                .name(createProduct.getName())
                .description(createProduct.getDescription())
                .brand(existBrand.getName())
                .category(category.getName())
                .subCategory(createProduct.getCategory().getName())
                .baseWeight(createProduct.getBaseWeightUnit())
                .stock(createProduct.getStock())
                .imageList(imageDto)
                .unitList(unitDto)
                .build();
    }

    @Override
    public List<ProductCard> getProductList() {
        List<Product> productList = productRepository.listOfFeaturedPageProduct();
        if(productList.isEmpty()){
            throw new RuntimeException("There is no product that is featuredPage");
        }

        return productList.stream()
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
    }

    @Override
    public List<ProductCard> getLastArrivalProductList() {
        List<Product> productList = productRepository.listOfArrivalProduct();
        if(productList.isEmpty()){
            throw new RuntimeException("There is no product that is featuredPage");
        }

        return productList.stream()
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
    }

    @Override
    public GetProductDetailResponse getProductDetail(UUID id) {
        Product existProduct = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product Not Found!!"));
        Brand productBrand = brandRepository.findById(existProduct.getBrand().getId()).orElseThrow(() -> new RuntimeException("Brand is not found"));
        Category productSubCategory = categoryRepository.findById(existProduct.getCategory().getId()).orElseThrow(() -> new RuntimeException("Category not found"));
        Category productCategory = categoryRepository.findByParentIdAndName(productSubCategory.getParentId(),productSubCategory.getName());

        return GetProductDetailResponse.builder()
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
    }

    @Override
    public Page<ProductCard> GetProductByCategory(UUID categoryId, int page, int size) {
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


        return new PageImpl<>(productCards,pageable,productList.getTotalElements());





    }


}
