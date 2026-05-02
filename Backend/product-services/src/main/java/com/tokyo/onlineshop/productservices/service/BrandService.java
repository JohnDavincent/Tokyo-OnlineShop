package com.tokyo.onlineshop.productservices.service;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.onlineshop.productservices.dto.CreateBrandRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestBody;

public interface BrandService {
    BaseResponse createBrand(@Valid @RequestBody CreateBrandRequest request);
    BaseResponse getBrandList();
}
