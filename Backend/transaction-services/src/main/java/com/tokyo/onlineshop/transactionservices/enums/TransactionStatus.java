package com.tokyo.onlineshop.transactionservices.enums;


public enum TransactionStatus {
    /** Legacy status for orders created before the payment flow existed. */
    PENDING,
    /** Order placed, payment window open. */
    WAITING_PAYMENT,
    /** Customer said they paid, waiting on the admin decision. */
    WAITING_CONFIRMATION,
    /** Admin approved the payment. */
    SUCCESS,
    /** Admin rejected the payment. */
    FAILED,
    /** Payment window closed before the customer confirmed. */
    EXPIRED
}
