package com.tokyo.onlineshop.paymentservices.dto;

import com.tokyo.onlineshop.paymentservices.enums.PaymentMethod;
import com.tokyo.onlineshop.paymentservices.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class AdminPaymentListDto {
    private UUID paymentId;
    private UUID transactionId;
    private String orderId;
    private BigDecimal amount;
    private PaymentStatus status;
    private PaymentMethod method;
    private String channelLabel;
    private String payerName;
    private String payerNote;
    private LocalDateTime submittedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
    private String reviewedBy;
    private String rejectionReason;
}
