package com.tokyo.common.event;

/**
 * Topic names shared by every service that speaks Kafka.
 * Keeping them here stops producer and consumer from drifting apart.
 */
public final class KafkaTopics {

    /** Published by transaction-services once a checkout is committed. */
    public static final String TRANSACTION_CREATED = "tokyo.transaction.created";

    /** Published by payment-services when a payment reaches a terminal state. */
    public static final String PAYMENT_COMPLETED = "tokyo.payment.completed";

    private KafkaTopics() {
    }
}
