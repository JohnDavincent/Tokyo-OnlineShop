package com.tokyo.onlineshop.productservices.service;

import com.tokyo.onlineshop.productservices.dto.CreateProductRequest;
import com.tokyo.onlineshop.productservices.dto.CreateProductResponse;
import com.tokyo.onlineshop.productservices.dto.ProductCard;

public interface ProductService {

    public CreateProductResponse createProduct(CreateProductRequest request);
    public ProductCard getProductList();
}
