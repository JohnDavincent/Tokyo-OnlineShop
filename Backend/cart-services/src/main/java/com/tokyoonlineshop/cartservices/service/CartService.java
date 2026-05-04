package com.tokyoonlineshop.cartservices.service;

import com.tokyo.common.dto.BaseResponse;

import java.util.UUID;

public interface CartService {

    public BaseResponse addProduct(UUID productId);
}
