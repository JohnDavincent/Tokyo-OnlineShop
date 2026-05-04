package com.tokyoonlineshop.cartservices.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AddProductRequest {
    private UUID productId;
    private UUID userId;
    private int quantity;
    private BigDecimal unit_price;
}
