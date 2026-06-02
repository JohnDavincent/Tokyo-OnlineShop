package com.tokyo.onlineshop.transactionservices.dto;

import com.tokyo.onlineshop.transactionservices.enums.TransactionStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class GetTransactionDetailResponseDto {
    private UUID transactionId;
    private String orderId;
    private TransactionStatus status;
    private BigDecimal grandTotal;
    private TransactionAddressResponseDto address;
    private List<AddTransactionDetailResponseDto> items;
}
