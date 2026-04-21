package com.tokyo.onlineshop.productservices.dto;

import com.tokyo.onlineshop.productservices.ProductionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data

public class UnitCard {
    private String unit;
    private Integer convertQuantity;
    private BigDecimal sellPrice;
    private ProductionStatus status;
}
