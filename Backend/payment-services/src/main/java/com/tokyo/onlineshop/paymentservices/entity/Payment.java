package com.tokyo.onlineshop.paymentservices.entity;

import com.tokyo.common.entity.BaseEntity;
import com.tokyo.onlineshop.paymentservices.enums.PaymentMethod;
import com.tokyo.onlineshop.paymentservices.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "payments", indexes = {
        @Index(name = "idx_payments_transaction_id", columnList = "transaction_id", unique = true),
        @Index(name = "idx_payments_status", columnList = "status")
})
public class Payment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "transaction_id", nullable = false, unique = true)
    private UUID transactionId;

    @Column(name = "order_id", nullable = false, length = 50)
    private String orderId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "amount", nullable = false)
    private BigDecimal amount;

    /** Null until the customer picks how they want to pay. */
    @Enumerated(EnumType.STRING)
    @Column(name = "method", length = 30)
    private PaymentMethod method;

    /** Snapshot of the channel the customer was told to pay to. */
    @Column(name = "channel_code", length = 50)
    private String channelCode;

    @Column(name = "channel_label", length = 120)
    private String channelLabel;

    @Column(name = "channel_account", length = 120)
    private String channelAccount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private PaymentStatus status;

    /** Name the customer says they transferred from — helps the admin match the mutation. */
    @Column(name = "payer_name", length = 120)
    private String payerName;

    @Column(name = "payer_note", length = 255)
    private String payerNote;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reviewed_by", length = 120)
    private String reviewedBy;

    @Column(name = "rejection_reason", length = 255)
    private String rejectionReason;

    public boolean isExpired(LocalDateTime now) {
        return status == PaymentStatus.WAITING_PAYMENT && expiresAt.isBefore(now);
    }
}
