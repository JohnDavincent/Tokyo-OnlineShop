package com.tokyo.onlineshop.productservices.service;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.onlineshop.productservices.dto.CreateProductRequest;
import com.tokyo.onlineshop.productservices.dto.GetProductClientResponse;
import com.tokyo.onlineshop.productservices.dto.RequestProductListDto;

import java.util.UUID;

public interface ProductService {

    BaseResponse createProduct(CreateProductRequest request);
    BaseResponse getProductListFeatured();
    BaseResponse getLastArrivalProductList();
    BaseResponse getProductDetail(UUID id);
    BaseResponse getProductByCategory(UUID categoryId, int page, int size);
    BaseResponse getProductList(RequestProductListDto request);
    GetProductClientResponse getProduct(UUID id);
}
