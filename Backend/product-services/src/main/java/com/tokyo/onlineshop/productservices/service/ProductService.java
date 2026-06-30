package com.tokyo.onlineshop.productservices.service;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.onlineshop.productservices.dto.request.CreateProductRequest;
import com.tokyo.onlineshop.productservices.dto.request.FlashSaleRequest;
import com.tokyo.onlineshop.productservices.dto.response.GetProductClientResponse;
import com.tokyo.onlineshop.productservices.dto.RequestProductListDto;

import java.util.List;
import java.util.UUID;

public interface ProductService {

    BaseResponse createProduct(CreateProductRequest request);
    BaseResponse getProductListFeatured();
    BaseResponse getLastArrivalProductList();
    BaseResponse getProductDetail(UUID id);
    BaseResponse getProductByCategory(UUID categoryId, int page, int size);
    BaseResponse getProductList(RequestProductListDto request);
    BaseResponse getTopSoldProducts();
    BaseResponse getNewProducts();
    BaseResponse markProductAsNew(UUID id);
    BaseResponse markProductAsFlashSale(UUID id, FlashSaleRequest request);
    BaseResponse endFlashSale(UUID id);
    GetProductClientResponse getProduct(UUID id);
    List<GetProductClientResponse> getProductListByIds(List<UUID> ids);
}
