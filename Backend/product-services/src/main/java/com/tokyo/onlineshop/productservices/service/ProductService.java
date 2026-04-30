package com.tokyo.onlineshop.productservices.service;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.onlineshop.productservices.dto.*;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.UUID;

public interface ProductService {

    public CreateProductResponse createProduct(CreateProductRequest request);
    public List<ProductCard> getProductListFeatured();
    public List<ProductCard> getLastArrivalProductList();
    public GetProductDetailResponse getProductDetail(UUID id);
    public Page<ProductCard> GetProductByCategory(UUID categoryId, int page, int size);
    public BaseResponse<ProductCard> GetProductList(RequestProductListDto request);
}
