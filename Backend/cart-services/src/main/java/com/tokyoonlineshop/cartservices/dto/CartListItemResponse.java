package com.tokyoonlineshop.cartservices.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Builder
@Data
public class CartListItemResponse {
    private String productName;
    private String productUnit;
    private int quantity;
    private BigDecimal price;
    private BigDecimal subTotal;
    private BigDecimal grandTotal;
}
