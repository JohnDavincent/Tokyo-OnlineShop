package com.tokyo.onlineshop.transactionservices.event;

import com.tokyo.common.event.KafkaTopics;
import com.tokyo.common.event.PaymentCompletedEvent;
import com.tokyo.onlineshop.transactionservices.service.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * The order status is driven entirely by what payment-services decides;
 * this listener is the only place a transaction reaches a final state.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentCompletedListener {

    private final TransactionService transactionService;

    @KafkaListener(
            topics = KafkaTopics.PAYMENT_COMPLETED,
            groupId = "${spring.kafka.consumer.group-id}"
    )
    public void onPaymentCompleted(PaymentCompletedEvent event) {
        log.info("[Kafka] payment {} for order {}", event.outcome(), event.orderId());
        transactionService.applyPaymentOutcome(event);
    }
}
