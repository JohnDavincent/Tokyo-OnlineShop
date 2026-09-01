package com.tokyo.onlineshop.transactionservices.dto;

import lombok.Builder;
import lombok.Data;

import com.tokyo.onlineshop.transactionservices.enums.TransactionStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class AddTransactionResponseDto {
    private UUID transactionId;
    private String orderId;
    private TransactionStatus status;
    private BigDecimal GrandTotal;
    private AddTransactionAddressResponseDto userAddress;
    private List<AddTransactionDetailResponseDto> transactionDetail;
}
