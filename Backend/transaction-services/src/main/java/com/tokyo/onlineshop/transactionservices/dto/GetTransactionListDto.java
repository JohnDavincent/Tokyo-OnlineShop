package com.tokyo.onlineshop.transactionservices.dto;

import com.tokyo.onlineshop.transactionservices.enums.TransactionStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Builder
@Getter
@Setter
public class GetTransactionListDto {
    private UUID transactionId;
    private String orderId;
    private TransactionStatus status;
    private BigDecimal grandTotal;
}
