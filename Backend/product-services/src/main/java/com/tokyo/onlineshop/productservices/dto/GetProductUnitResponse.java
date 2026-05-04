package com.tokyo.onlineshop.productservices.dto;

import com.tokyo.onlineshop.productservices.ProductionStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class GetProductUnitResponse {
    private String unit;
    private BigDecimal price;
    private ProductionStatus status;
}
