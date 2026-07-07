package com.tokyo.onlineshop.transactionservices.dto;

import com.tokyo.onlineshop.transactionservices.enums.TransactionStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Builder
@Getter
@Setter
public class GetAdminTransactionListDto {
    private UUID transactionId;
    private String orderId;
    private TransactionStatus status;
    private BigDecimal grandTotal;
    private String customerName;
    private String customerPhone;
    private LocalDateTime createdAt;
    private int itemCount;
}
