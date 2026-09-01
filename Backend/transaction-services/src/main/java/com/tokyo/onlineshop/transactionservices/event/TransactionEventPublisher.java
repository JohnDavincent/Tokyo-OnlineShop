package com.tokyo.onlineshop.transactionservices.event;

import com.tokyo.common.event.KafkaTopics;
import com.tokyo.common.event.TransactionCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Publishes the checkout event only after the order has actually committed,
 * so payment-services can never open a window for a rolled back order.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TransactionEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onTransactionCreated(TransactionCreatedEvent event) {
        kafkaTemplate.send(KafkaTopics.TRANSACTION_CREATED, event.orderId(), event)
                .whenComplete((result, error) -> {
                    if (error != null) {
                        log.error("[Kafka] failed to publish checkout for order {}", event.orderId(), error);
                    } else {
                        log.info("[Kafka] published checkout for order {}", event.orderId());
                    }
                });
    }
}
