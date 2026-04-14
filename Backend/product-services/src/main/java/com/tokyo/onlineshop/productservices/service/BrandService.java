package com.tokyo.onlineshop.productservices.service;

import com.tokyo.onlineshop.productservices.dto.CreateBrandRequest;
import com.tokyo.onlineshop.productservices.dto.CreateBrandResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestBody;

public interface BrandService {
    public CreateBrandResponse createBrand(@Valid @RequestBody CreateBrandRequest request);
}
