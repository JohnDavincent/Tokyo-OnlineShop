package com.tokyoonlineshop.cartservices.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Builder
@Data
public class CartListItemResponse {
    private UUID cartId;
    private UUID productId;
    private String productName;
    private String productUnit;
    private int quantity;
    private BigDecimal price;
    private BigDecimal subTotal;
    private BigDecimal grandTotal;
}
