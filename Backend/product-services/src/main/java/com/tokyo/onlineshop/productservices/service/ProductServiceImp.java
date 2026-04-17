package com.tokyo.onlineshop.productservices.service;

import com.tokyo.onlineshop.productservices.ProductionStatus;
import com.tokyo.onlineshop.productservices.dto.*;
import com.tokyo.onlineshop.productservices.entity.Brand;
import com.tokyo.onlineshop.productservices.entity.Category;
import com.tokyo.onlineshop.productservices.entity.Product;
import com.tokyo.onlineshop.productservices.entity.ProductUnit;
import com.tokyo.onlineshop.productservices.repository.BrandRepository;
import com.tokyo.onlineshop.productservices.repository.CategoryRepository;
import com.tokyo.onlineshop.productservices.repository.ProductRepository;
import com.tokyo.onlineshop.productservices.repository.ProductUnitRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collector;

@Service
@RequiredArgsConstructor
public class ProductServiceImp implements ProductService {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
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
    public ProductCard getProductList() {
        
    }


}
