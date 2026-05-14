package com.tokyo.onlineshop.transactionservices.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Builder
@Data
public class AddTransactionDetailRequest {
    private String productId;
    private String productUnitId;
    private BigDecimal price;
    private String productName;
    private Integer quantity;
    private BigDecimal subTotal;
}


