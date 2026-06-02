package com.tokyo.onlineshop.transactionservices.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class AddTransactionResponseDto {
    private String orderId;
    private BigDecimal GrandTotal;
    private AddTransactionAddressResponseDto userAddress;
    private List<AddTransactionDetailResponseDto> transactionDetail;
}
