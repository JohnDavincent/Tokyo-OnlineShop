package com.tokyo.onlineshop.transactionservices.config;

import com.tokyo.common.event.KafkaTopics;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

/**
 * Declares the topics so a fresh broker does not rely on auto-creation.
 */
@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic transactionCreatedTopic() {
        return TopicBuilder.name(KafkaTopics.TRANSACTION_CREATED).partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic paymentCompletedTopic() {
        return TopicBuilder.name(KafkaTopics.PAYMENT_COMPLETED).partitions(1).replicas(1).build();
    }
}
