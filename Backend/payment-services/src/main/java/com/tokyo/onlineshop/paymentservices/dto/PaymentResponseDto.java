package com.tokyo.onlineshop.paymentservices.dto;

import com.tokyo.onlineshop.paymentservices.enums.PaymentMethod;
import com.tokyo.onlineshop.paymentservices.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class PaymentResponseDto {
    private UUID paymentId;
    private UUID transactionId;
    private String orderId;
    private BigDecimal amount;
    private PaymentStatus status;
    private PaymentMethod method;
    private String channelCode;
    private LocalDateTime expiresAt;
    /** Seconds left on the payment window; 0 once it has lapsed. */
    private long secondsRemaining;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private String rejectionReason;
    private String payerName;
    private String payerNote;
    /** Instructions for the channel the customer picked, if any. */
    private PaymentChannelDto selectedChannel;
    /** Every channel the shop accepts, so the page can render the choices. */
    private List<PaymentChannelDto> availableChannels;
}
