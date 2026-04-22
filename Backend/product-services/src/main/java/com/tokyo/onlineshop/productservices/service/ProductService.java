package com.tokyo.onlineshop.productservices.service;

import com.tokyo.onlineshop.productservices.dto.CreateProductRequest;
import com.tokyo.onlineshop.productservices.dto.CreateProductResponse;
import com.tokyo.onlineshop.productservices.dto.ProductCard;

import java.util.List;

public interface ProductService {

    public CreateProductResponse createProduct(CreateProductRequest request);
    public List<ProductCard> getProductList();
    public List<ProductCard> getLastArrivalProductList();
}
