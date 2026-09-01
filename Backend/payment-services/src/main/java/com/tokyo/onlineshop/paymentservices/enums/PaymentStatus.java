package com.tokyo.onlineshop.paymentservices.enums;

public enum PaymentStatus {
    /** Payment window is open, customer has not confirmed yet. */
    WAITING_PAYMENT,
    /** Customer pressed "I have paid" — sitting in the admin inbox. */
    WAITING_CONFIRMATION,
    /** Admin approved. */
    PAID,
    /** Admin rejected. */
    REJECTED,
    /** Window closed before the customer confirmed. */
    EXPIRED
}
