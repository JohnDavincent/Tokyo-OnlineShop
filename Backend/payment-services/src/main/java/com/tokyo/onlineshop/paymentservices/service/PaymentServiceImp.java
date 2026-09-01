package com.tokyo.onlineshop.paymentservices.service;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.common.dto.PagingResponse;
import com.tokyo.common.event.PaymentCompletedEvent;
import com.tokyo.common.event.PaymentOutcome;
import com.tokyo.common.event.TransactionCreatedEvent;
import com.tokyo.common.exception.BadRequestException;
import com.tokyo.common.exception.ForbiddenException;
import com.tokyo.common.exception.NotFoundException;
import com.tokyo.onlineshop.paymentservices.config.PaymentProperties;
import com.tokyo.onlineshop.paymentservices.dto.AdminPaymentListDto;
import com.tokyo.onlineshop.paymentservices.dto.ConfirmPaymentRequest;
import com.tokyo.onlineshop.paymentservices.dto.PaymentChannelDto;
import com.tokyo.onlineshop.paymentservices.dto.PaymentInboxCountDto;
import com.tokyo.onlineshop.paymentservices.dto.PaymentResponseDto;
import com.tokyo.onlineshop.paymentservices.dto.RejectPaymentRequest;
import com.tokyo.onlineshop.paymentservices.entity.Payment;
import com.tokyo.onlineshop.paymentservices.enums.PaymentStatus;
import com.tokyo.onlineshop.paymentservices.repository.PaymentRepository;
import com.tokyo.onlineshop.paymentservices.specification.PaymentSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImp implements PaymentService {

    private final PaymentRepository repository;
    private final PaymentProperties properties;
    private final ApplicationEventPublisher eventPublisher;

    /* ------------------------------------------------------------------
     * Inbound: a checkout happened
     * ------------------------------------------------------------------ */

    @Transactional
    @Override
    public void openPaymentWindow(TransactionCreatedEvent event) {
        // Kafka delivers at least once, so a replay must not open a second window.
        if (repository.existsByTransactionId(event.transactionId())) {
            log.info("Payment already exists for transaction {}, ignoring duplicate event", event.transactionId());
            return;
        }

        Payment payment = Payment.builder()
                .transactionId(event.transactionId())
                .orderId(event.orderId())
                .userId(event.userId())
                .amount(event.grandTotal())
                .status(PaymentStatus.WAITING_PAYMENT)
                .expiresAt(LocalDateTime.now().plusMinutes(properties.getExpiryMinutes()))
                .build();

        repository.save(payment);
        log.info("Opened payment window for order {} (expires {})", payment.getOrderId(), payment.getExpiresAt());
    }

    /* ------------------------------------------------------------------
     * Customer facing
     * ------------------------------------------------------------------ */

    @Override
    public BaseResponse getChannels() {
        return ok(enabledChannels().stream().map(this::toChannelDto).toList(), "Payment channels retrieved successfully");
    }

    @Transactional
    @Override
    public BaseResponse getPaymentByTransaction(UUID transactionId) {
        Payment payment = repository.findByTransactionId(transactionId)
                .orElseThrow(() -> new NotFoundException("No payment found for this transaction"));

        requireOwner(payment);
        lapseIfOverdue(payment);

        return ok(toResponse(payment), "Payment retrieved successfully");
    }

    @Transactional
    @Override
    public BaseResponse selectMethod(UUID paymentId, String channelCode) {
        Payment payment = repository.findById(paymentId)
                .orElseThrow(() -> new NotFoundException("Payment not found"));

        requireOwner(payment);
        lapseIfOverdue(payment);

        if (payment.getStatus() != PaymentStatus.WAITING_PAYMENT) {
            throw new BadRequestException("This payment can no longer be changed");
        }

        PaymentProperties.Channel channel = enabledChannels().stream()
                .filter(c -> c.getCode().equalsIgnoreCase(channelCode))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Unknown payment channel: " + channelCode));

        payment.setMethod(channel.getMethod());
        payment.setChannelCode(channel.getCode());
        payment.setChannelLabel(channel.getLabel());
        payment.setChannelAccount(channel.getAccountNumber());
        repository.save(payment);

        return ok(toResponse(payment), "Payment method selected");
    }

    @Transactional
    @Override
    public BaseResponse confirmPayment(UUID paymentId, ConfirmPaymentRequest request) {
        Payment payment = repository.findById(paymentId)
                .orElseThrow(() -> new NotFoundException("Payment not found"));

        requireOwner(payment);
        lapseIfOverdue(payment);

        if (payment.getStatus() == PaymentStatus.EXPIRED) {
            throw new BadRequestException("The payment window has closed for this order");
        }
        if (payment.getStatus() != PaymentStatus.WAITING_PAYMENT) {
            throw new BadRequestException("This payment has already been submitted");
        }
        if (payment.getMethod() == null) {
            throw new BadRequestException("Choose a payment method first");
        }

        payment.setStatus(PaymentStatus.WAITING_CONFIRMATION);
        payment.setSubmittedAt(LocalDateTime.now());
        if (request != null) {
            payment.setPayerName(blankToNull(request.getPayerName()));
            payment.setPayerNote(blankToNull(request.getNote()));
        }
        repository.save(payment);

        log.info("Order {} submitted for admin confirmation", payment.getOrderId());
        return ok(toResponse(payment), "Payment submitted. Waiting for admin confirmation.");
    }

    /* ------------------------------------------------------------------
     * Admin facing
     * ------------------------------------------------------------------ */

    @Override
    public BaseResponse getAdminPaymentList(int currentPage, int pageSize, String status, String keyword) {
        // The inbox defaults to what actually needs a decision.
        String effectiveStatus = (status == null || status.isBlank())
                ? PaymentStatus.WAITING_CONFIRMATION.name()
                : status;

        Specification<Payment> spec = Specification.allOf(
                PaymentSpecification.hasStatus(effectiveStatus),
                PaymentSpecification.searchKeyword(keyword)
        );

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Page<Payment> page = repository.findAll(spec, PageRequest.of(Math.max(currentPage - 1, 0), pageSize, sort));

        List<AdminPaymentListDto> items = page.getContent().stream()
                .map(this::toAdminDto)
                .toList();

        PagingResponse response = PagingResponse.builder()
                .items(items)
                .currentPage(currentPage)
                .pageSize(pageSize)
                .totalPages(page.getTotalPages())
                .totalItems(page.getTotalElements())
                .build();

        return ok(response, "Payment list retrieved successfully");
    }

    @Override
    public BaseResponse getAdminPaymentDetail(UUID paymentId) {
        Payment payment = repository.findById(paymentId)
                .orElseThrow(() -> new NotFoundException("Payment not found"));
        return ok(toAdminDto(payment), "Payment detail retrieved successfully");
    }

    @Override
    public BaseResponse getAdminPaymentByTransaction(UUID transactionId) {
        Payment payment = repository.findByTransactionId(transactionId)
                .orElseThrow(() -> new NotFoundException("No payment found for this transaction"));
        return ok(toAdminDto(payment), "Payment detail retrieved successfully");
    }

    @Override
    public BaseResponse getInboxCount() {
        PaymentInboxCountDto data = PaymentInboxCountDto.builder()
                .waitingConfirmation(repository.countByStatus(PaymentStatus.WAITING_CONFIRMATION))
                .waitingPayment(repository.countByStatus(PaymentStatus.WAITING_PAYMENT))
                .build();
        return ok(data, "Inbox count retrieved successfully");
    }

    @Transactional
    @Override
    public BaseResponse approvePayment(UUID paymentId) {
        Payment payment = requireReviewable(paymentId);

        payment.setStatus(PaymentStatus.PAID);
        payment.setReviewedAt(LocalDateTime.now());
        payment.setReviewedBy(currentUser());
        repository.save(payment);

        publishOutcome(payment, PaymentOutcome.APPROVED, null);

        log.info("Order {} approved by {}", payment.getOrderId(), payment.getReviewedBy());
        return ok(toAdminDto(payment), "Payment approved");
    }

    @Transactional
    @Override
    public BaseResponse rejectPayment(UUID paymentId, RejectPaymentRequest request) {
        Payment payment = requireReviewable(paymentId);

        String reason = request == null ? null : blankToNull(request.getReason());

        payment.setStatus(PaymentStatus.REJECTED);
        payment.setReviewedAt(LocalDateTime.now());
        payment.setReviewedBy(currentUser());
        payment.setRejectionReason(reason);
        repository.save(payment);

        publishOutcome(payment, PaymentOutcome.REJECTED, reason);

        log.info("Order {} rejected by {}", payment.getOrderId(), payment.getReviewedBy());
        return ok(toAdminDto(payment), "Payment rejected");
    }

    /* ------------------------------------------------------------------
     * Expiry sweep
     * ------------------------------------------------------------------ */

    @Transactional
    @Override
    public int expireOverduePayments() {
        List<Payment> overdue = repository.findAllByStatusAndExpiresAtBefore(
                PaymentStatus.WAITING_PAYMENT, LocalDateTime.now());

        for (Payment payment : overdue) {
            markExpired(payment);
        }

        return overdue.size();
    }

    /* ------------------------------------------------------------------
     * Helpers
     * ------------------------------------------------------------------ */

    private Payment requireReviewable(UUID paymentId) {
        Payment payment = repository.findById(paymentId)
                .orElseThrow(() -> new NotFoundException("Payment not found"));

        if (payment.getStatus() != PaymentStatus.WAITING_CONFIRMATION) {
            throw new BadRequestException("Only payments waiting for confirmation can be reviewed");
        }
        return payment;
    }

    /**
     * Marks a lapsed window expired the moment anyone looks at it, so a customer
     * never sees a live pay-now screen for a window the sweep has not reached yet.
     */
    private void lapseIfOverdue(Payment payment) {
        if (payment.isExpired(LocalDateTime.now())) {
            markExpired(payment);
        }
    }

    private void markExpired(Payment payment) {
        payment.setStatus(PaymentStatus.EXPIRED);
        payment.setReviewedAt(LocalDateTime.now());
        payment.setReviewedBy("SYSTEM");
        payment.setRejectionReason("Payment window expired");
        repository.save(payment);
        publishOutcome(payment, PaymentOutcome.EXPIRED, "Payment window expired");
    }

    private void publishOutcome(Payment payment, PaymentOutcome outcome, String reason) {
        eventPublisher.publishEvent(new PaymentCompletedEvent(
                payment.getId(),
                payment.getTransactionId(),
                payment.getOrderId(),
                payment.getUserId(),
                outcome,
                reason,
                payment.getReviewedBy(),
                LocalDateTime.now()
        ));
    }

    private void requireOwner(Payment payment) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new ForbiddenException("Please login first");
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        if (isAdmin) {
            return;
        }

        if (!payment.getUserId().toString().equals(authentication.getName())) {
            throw new ForbiddenException("You are not authorized to view this payment");
        }
    }

    private String currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication == null ? "SYSTEM" : authentication.getName();
    }

    private List<PaymentProperties.Channel> enabledChannels() {
        return properties.getChannels().stream()
                .filter(PaymentProperties.Channel::isEnabled)
                .toList();
    }

    private PaymentChannelDto toChannelDto(PaymentProperties.Channel channel) {
        return PaymentChannelDto.builder()
                .code(channel.getCode())
                .method(channel.getMethod())
                .label(channel.getLabel())
                .accountNumber(channel.getAccountNumber())
                .accountName(channel.getAccountName())
                .qrImageUrl(channel.getQrImageUrl())
                .instruction(channel.getInstruction())
                .build();
    }

    private PaymentResponseDto toResponse(Payment payment) {
        PaymentChannelDto selected = payment.getChannelCode() == null ? null :
                enabledChannels().stream()
                        .filter(c -> c.getCode().equalsIgnoreCase(payment.getChannelCode()))
                        .findFirst()
                        .map(this::toChannelDto)
                        .orElse(null);

        long secondsRemaining = payment.getStatus() == PaymentStatus.WAITING_PAYMENT
                ? Math.max(0, Duration.between(LocalDateTime.now(), payment.getExpiresAt()).getSeconds())
                : 0;

        return PaymentResponseDto.builder()
                .paymentId(payment.getId())
                .transactionId(payment.getTransactionId())
                .orderId(payment.getOrderId())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .method(payment.getMethod())
                .channelCode(payment.getChannelCode())
                .expiresAt(payment.getExpiresAt())
                .secondsRemaining(secondsRemaining)
                .submittedAt(payment.getSubmittedAt())
                .reviewedAt(payment.getReviewedAt())
                .rejectionReason(payment.getRejectionReason())
                .payerName(payment.getPayerName())
                .payerNote(payment.getPayerNote())
                .selectedChannel(selected)
                .availableChannels(enabledChannels().stream().map(this::toChannelDto).toList())
                .build();
    }

    private AdminPaymentListDto toAdminDto(Payment payment) {
        return AdminPaymentListDto.builder()
                .paymentId(payment.getId())
                .transactionId(payment.getTransactionId())
                .orderId(payment.getOrderId())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .method(payment.getMethod())
                .channelLabel(payment.getChannelLabel())
                .payerName(payment.getPayerName())
                .payerNote(payment.getPayerNote())
                .submittedAt(payment.getSubmittedAt())
                .expiresAt(payment.getExpiresAt())
                .createdAt(payment.getCreatedAt())
                .reviewedAt(payment.getReviewedAt())
                .reviewedBy(payment.getReviewedBy())
                .rejectionReason(payment.getRejectionReason())
                .build();
    }

    private BaseResponse ok(Object data, String message) {
        return BaseResponse.builder()
                .status(HttpStatus.OK.value())
                .code(HttpStatus.OK)
                .message(message)
                .data(data)
                .build();
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}
