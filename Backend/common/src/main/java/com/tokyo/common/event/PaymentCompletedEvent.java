package com.tokyo.common.event;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Emitted by payment-services when a payment settles one way or the other.
 * transaction-services listens for this to move the order to its final status.
 */
public record PaymentCompletedEvent(
        UUID paymentId,
        UUID transactionId,
        String orderId,
        UUID userId,
        PaymentOutcome outcome,
        String reason,
        String reviewedBy,
        LocalDateTime occurredAt
) {
}
