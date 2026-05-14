package com.tokyoonlineshop.cartservices.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class CartDetailDto {
    private UUID cartDetailId;
    private UUID productId;
    private UUID productUnitId;
    private String productName;
    private String productUnit;
    private BigDecimal price;
    private BigDecimal subTotal;
    private Integer quantity;
}
