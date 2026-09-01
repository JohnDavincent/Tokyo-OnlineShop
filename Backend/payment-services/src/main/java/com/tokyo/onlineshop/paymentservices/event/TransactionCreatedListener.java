package com.tokyo.onlineshop.paymentservices.event;

import com.tokyo.common.event.KafkaTopics;
import com.tokyo.common.event.TransactionCreatedEvent;
import com.tokyo.onlineshop.paymentservices.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * A new checkout means a new payment window.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TransactionCreatedListener {

    private final PaymentService paymentService;

    @KafkaListener(
            topics = KafkaTopics.TRANSACTION_CREATED,
            groupId = "${spring.kafka.consumer.group-id}"
    )
    public void onTransactionCreated(TransactionCreatedEvent event) {
        log.info("[Kafka] transaction created for order {}", event.orderId());
        paymentService.openPaymentWindow(event);
    }
}
