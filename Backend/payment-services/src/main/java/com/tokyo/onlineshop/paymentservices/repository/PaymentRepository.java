package com.tokyo.onlineshop.paymentservices.repository;

import com.tokyo.onlineshop.paymentservices.entity.Payment;
import com.tokyo.onlineshop.paymentservices.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID>, JpaSpecificationExecutor<Payment> {

    Optional<Payment> findByTransactionId(UUID transactionId);

    Optional<Payment> findByOrderId(String orderId);

    boolean existsByTransactionId(UUID transactionId);

    long countByStatus(PaymentStatus status);

    List<Payment> findAllByStatusAndExpiresAtBefore(PaymentStatus status, LocalDateTime cutoff);
}
