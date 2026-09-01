package com.tokyo.common.event;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Emitted after a checkout transaction is persisted. payment-services listens for
 * this and opens a payment window for the order.
 */
public record TransactionCreatedEvent(
        UUID transactionId,
        String orderId,
        UUID userId,
        BigDecimal grandTotal,
        LocalDateTime createdAt
) {
}
