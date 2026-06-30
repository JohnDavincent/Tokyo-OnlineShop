package com.tokyo.onlineshop.productservices.service;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.common.exception.BadRequestException;
import com.tokyo.common.exception.ConflictException;
import com.tokyo.common.exception.NotFoundException;
import com.tokyo.common.ProductionStatus;
import com.tokyo.onlineshop.productservices.dto.request.CreateBrandRequest;
import com.tokyo.onlineshop.productservices.dto.response.CreateBrandResponse;
import com.tokyo.onlineshop.productservices.entity.Brand;
import com.tokyo.onlineshop.productservices.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class BrandServiceImp implements BrandService{

    private final BrandRepository brandRepository;

    @Override
    public BaseResponse createBrand(CreateBrandRequest request) {
        if(request == null){
            throw new BadRequestException("The field must be fill!");
        }
        if(brandRepository.existsByName(request.getName())){
            throw new ConflictException("Brand Already exists!!");
        }
        String slug = request.getName().toLowerCase(Locale.ROOT).strip().replaceAll("//s+", "-");
        Brand createBrand = Brand.builder()
                .name(request.getName())
                .slug(slug)
                .productList(new ArrayList<>())
                .status(ProductionStatus.AVAILABLE)
                .build();

        brandRepository.save(createBrand);

        CreateBrandResponse data = CreateBrandResponse.builder()
                .name(createBrand.getName())
                .slug(createBrand.getSlug())
                .status(createBrand.getStatus())
                .build();

        return BaseResponse.builder()
                .status(HttpStatus.CREATED.value())
                .code(HttpStatus.CREATED)
                .message("Brand created successfully")
                .data(data)
                .build();
    }

    @Override
    public BaseResponse getBrandList() {
        List<Brand> brands = brandRepository.findAll();
        if(brands.isEmpty()){
            throw new NotFoundException("No brands found");
        }

        List<CreateBrandResponse> data = brands.stream()
                .map(brand -> CreateBrandResponse.builder()
                        .name(brand.getName())
                        .slug(brand.getSlug())
                        .status(brand.getStatus())
                        .build()
                ).toList();

        return BaseResponse.builder()
                .status(HttpStatus.OK.value())
                .code(HttpStatus.OK)
                .message("Brands retrieved successfully")
                .data(data)
                .build();
    }
}
