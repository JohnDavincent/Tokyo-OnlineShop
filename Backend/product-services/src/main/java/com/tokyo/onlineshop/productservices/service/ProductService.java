package com.tokyo.onlineshop.productservices.service;

import com.tokyo.onlineshop.productservices.dto.CreateProductRequest;
import com.tokyo.onlineshop.productservices.dto.CreateProductResponse;

public interface ProductService {

    public CreateProductResponse createProduct(CreateProductRequest request);
}
