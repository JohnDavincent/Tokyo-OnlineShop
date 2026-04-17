package com.tokyo.onlineshop.productservices.service;

import com.tokyo.onlineshop.productservices.dto.CreateProductRequest;
import com.tokyo.onlineshop.productservices.dto.CreateUnitRequest;
import com.tokyo.onlineshop.productservices.dto.CreateUnitResponse;
import com.tokyo.onlineshop.productservices.entity.Product;

import java.util.List;
import java.util.UUID;

public interface ProductUnitService {

    List<CreateUnitResponse> createUnit (UUID productId, List<CreateUnitRequest> request);
}
