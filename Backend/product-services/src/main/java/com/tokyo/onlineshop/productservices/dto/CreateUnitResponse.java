package com.tokyo.onlineshop.productservices.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class CreateUnitResponse {
    private UUID id;
    private String unit;
    private Integer convertUnit;
    private BigDecimal basePrice;
    private BigDecimal sellPrice;
}
