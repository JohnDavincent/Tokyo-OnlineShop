package com.tokyo.onlineshop.productservices.service;

import com.tokyo.onlineshop.productservices.ProductionStatus;
import com.tokyo.onlineshop.productservices.dto.CreateBrandRequest;
import com.tokyo.onlineshop.productservices.dto.CreateBrandResponse;
import com.tokyo.onlineshop.productservices.entity.Brand;
import com.tokyo.onlineshop.productservices.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class BrandServiceImp implements BrandService{

    private final BrandRepository brandRepository;

    @Override
    public CreateBrandResponse createBrand(CreateBrandRequest request) {
        if(request == null){
            throw new RuntimeException("The field must be fill!");
        }
        if(brandRepository.existsByName(request.getName())){
            throw new RuntimeException("Brand Already exists!!");
        }
        String slug = request.getName().toLowerCase(Locale.ROOT).strip().replaceAll("//s+", "-");
        Brand createBrand = Brand.builder()
                .name(request.getName())
                .slug(slug)
                .productList(new ArrayList<>())
                .status(ProductionStatus.AVAILABLE)
                .build();

        brandRepository.save(createBrand);

        return CreateBrandResponse.builder()
                .name(createBrand.getName())
                .slug(createBrand.getSlug())
                .status(createBrand.getStatus())
                .build();
    }
}
