package com.tokyo.onlineshop.paymentservices.event;

import com.tokyo.common.event.KafkaTopics;
import com.tokyo.common.event.PaymentCompletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Pushes payment outcomes onto Kafka only once the local transaction has
 * committed, so downstream services never see a state we then rolled back.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPaymentCompleted(PaymentCompletedEvent event) {
        kafkaTemplate.send(KafkaTopics.PAYMENT_COMPLETED, event.orderId(), event)
                .whenComplete((result, error) -> {
                    if (error != null) {
                        log.error("[Kafka] failed to publish payment outcome for order {}", event.orderId(), error);
                    } else {
                        log.info("[Kafka] published {} for order {}", event.outcome(), event.orderId());
                    }
                });
    }
}
