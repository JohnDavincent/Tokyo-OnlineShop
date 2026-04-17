package com.tokyo.onlineshop.productservices.service;

import com.tokyo.onlineshop.productservices.dto.CreateImageRequest;
import com.tokyo.onlineshop.productservices.dto.CreateImageResponse;
import com.tokyo.onlineshop.productservices.dto.CreateProductRequest;

import java.util.List;
import java.util.UUID;

public interface ProductImageService {

    public List<CreateImageResponse> addImage(UUID productId, List<CreateImageRequest> request);
}
