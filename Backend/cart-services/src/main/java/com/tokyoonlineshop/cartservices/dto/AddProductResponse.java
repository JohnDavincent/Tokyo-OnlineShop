package com.tokyoonlineshop.cartservices.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Builder
@Data
public class AddProductResponse {
    private String productName;
    private int quantity;
    private BigDecimal subTotal;
}
