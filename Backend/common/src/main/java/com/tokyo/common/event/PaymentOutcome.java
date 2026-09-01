package com.tokyo.common.event;

/**
 * Terminal outcome of a payment, as seen by the rest of the system.
 */
public enum PaymentOutcome {
    /** Admin approved the payment proof. */
    APPROVED,
    /** Admin rejected the payment proof. */
    REJECTED,
    /** The payment window closed before the customer confirmed. */
    EXPIRED
}
