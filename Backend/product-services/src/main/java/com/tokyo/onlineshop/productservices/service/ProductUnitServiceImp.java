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

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProductUnitServiceImp implements ProductUnitService{

    private final ProductUnitRepository productUnitRepository;
    private final ProductRepository productRepository;

    @Override
    public List<CreateUnitResponse> createUnit(UUID productId, List<CreateUnitRequest> request) {

        if(request == null){
            throw new RuntimeException("Field must be fill");
        }
        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found!!"));
        List<ProductUnit> unitList = new ArrayList<>();

        for(CreateUnitRequest unit : request){
            if(productUnitRepository.existsByUnitAndQuantity(
                    unit.getUnit(),
                    unit.getConvertQuantity(),
                    productId)
            ){
                throw new RuntimeException("unit Already Exists");
            }
            ProductUnit createUnit = ProductUnit.builder()
                    .convertQuantity(unit.getConvertQuantity())
                    .status(ProductionStatus.AVAILABLE)
                    .unitBasePrice(unit.getBasePrice())
                    .unitSellPrice(unit.getSellPrice())
                    .unit(unit.getUnit())
                    .product(product)
                    .build();

            product.addProductUnit(createUnit);
            productUnitRepository.save(createUnit);

            unitList.add(createUnit);
        }

        return unitList.stream()
                .map(unit -> {
                    return CreateUnitResponse.builder()
                            .convertUnit(unit.getConvertQuantity())
                            .basePrice(unit.getUnitBasePrice())
                            .sellPrice(unit.getUnitSellPrice())
                            .unit(unit.getUnit())
                            .build();
                }).collect(Collectors.toList());



    }
}
