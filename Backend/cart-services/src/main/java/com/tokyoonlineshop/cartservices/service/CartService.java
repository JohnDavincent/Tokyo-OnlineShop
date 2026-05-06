package com.tokyoonlineshop.cartservices.service;

import com.tokyo.common.dto.BaseResponse;
import com.tokyoonlineshop.cartservices.dto.AddProductRequest;

import java.util.UUID;

public interface CartService {

    public BaseResponse addProduct(AddProductRequest request);
    public BaseResponse getCartList();
}
