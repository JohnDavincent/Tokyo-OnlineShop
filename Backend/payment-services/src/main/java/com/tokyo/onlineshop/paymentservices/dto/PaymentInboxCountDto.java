package com.tokyo.onlineshop.paymentservices.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentInboxCountDto {
    /** Payments sitting in the admin inbox waiting for a decision. */
    private long waitingConfirmation;
    /** Payment windows still open. */
    private long waitingPayment;
}
