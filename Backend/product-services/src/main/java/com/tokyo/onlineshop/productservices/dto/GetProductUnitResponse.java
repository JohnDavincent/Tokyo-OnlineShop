package com.tokyo.onlineshop.productservices.dto;

import com.tokyo.common.ProductionStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class GetProductUnitResponse {
    private UUID unitId;
    private String unit;
    private BigDecimal price;
    private ProductionStatus status;
}
