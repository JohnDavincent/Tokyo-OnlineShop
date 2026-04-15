package com.tokyo.onlineshop.productservices.service;

import com.tokyo.onlineshop.productservices.ProductionStatus;
import com.tokyo.onlineshop.productservices.dto.CreateProductRequest;
import com.tokyo.onlineshop.productservices.dto.CreateUnitRequest;
import com.tokyo.onlineshop.productservices.dto.CreateUnitResponse;
import com.tokyo.onlineshop.productservices.entity.Product;
import com.tokyo.onlineshop.productservices.entity.ProductUnit;
import com.tokyo.onlineshop.productservices.repository.ProductRepository;
import com.tokyo.onlineshop.productservices.repository.ProductUnitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProductUnitServiceImp implements ProductUnitService{

    private ProductUnitRepository productUnitRepository;
    private ProductRepository productRepository;

    @Override
    public CreateUnitResponse createUnit(UUID productId, CreateProductRequest request) {
        if(request == null){
            throw new RuntimeException("Field must be fill");
        }
        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found!!"));

        if(productUnitRepository.ExistsByUnitAndQuantity(
                request.getUnit(),
                request.getConvertQuantity(),
                productId
        )) {
            throw new RuntimeException("Product unit already exists");
        }

        ProductUnit createUnit = ProductUnit.builder()
                .unit(request.getUnit())
                .convertQuantity(request.getConvertQuantity())
                .unitBasePrice(request.getBasePrice())
                .unitSellPrice(request.getSellPrice())
                .product(product)
                .status(ProductionStatus.AVAILABLE)
                .build();

        product.addProductUnit(createUnit);
        productUnitRepository.save(createUnit);


        return CreateUnitResponse.builder()
                .unit(createUnit.getUnit())
                .basePrice(createUnit.getUnitBasePrice())
                .sellPrice(createUnit.getUnitSellPrice())
                .convertUnit(createUnit.getConvertQuantity())
                .build();
    }
}
