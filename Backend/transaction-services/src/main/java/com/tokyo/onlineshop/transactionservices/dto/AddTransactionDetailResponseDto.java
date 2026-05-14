package com.tokyo.onlineshop.transactionservices.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Builder
@Data
public class AddTransactionDetailResponseDto {
    private String productName;
    private String productUnit;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal subTotal;
}
