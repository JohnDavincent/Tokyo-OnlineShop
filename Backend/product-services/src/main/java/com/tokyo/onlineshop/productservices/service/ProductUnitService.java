package com.tokyo.onlineshop.productservices.service;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.onlineshop.productservices.dto.CreateUnitRequest;
import com.tokyo.onlineshop.productservices.dto.GetProductUnitResponse;

import java.util.List;
import java.util.UUID;

public interface ProductUnitService {

    BaseResponse createUnit(UUID productId, List<CreateUnitRequest> request);
    List<GetProductUnitResponse> getUnit(List<UUID> unitId, UUID productId);
}
