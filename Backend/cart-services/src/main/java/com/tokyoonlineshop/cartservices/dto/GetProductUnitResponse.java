package com.tokyoonlineshop.cartservices.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import com.tokyo.common.ProductionStatus;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GetProductUnitResponse {
    private UUID unitId;
    private String unit;
    private BigDecimal price;
    private ProductionStatus status;



}
