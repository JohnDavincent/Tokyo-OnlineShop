package com.tokyo.onlineshop.paymentservices.service;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.common.event.TransactionCreatedEvent;
import com.tokyo.onlineshop.paymentservices.dto.ConfirmPaymentRequest;
import com.tokyo.onlineshop.paymentservices.dto.RejectPaymentRequest;

import java.util.UUID;

public interface PaymentService {

    /** Opens a payment window for a freshly created transaction. Idempotent. */
    void openPaymentWindow(TransactionCreatedEvent event);

    BaseResponse getChannels();

    BaseResponse getPaymentByTransaction(UUID transactionId);

    BaseResponse selectMethod(UUID paymentId, String channelCode);

    BaseResponse confirmPayment(UUID paymentId, ConfirmPaymentRequest request);

    BaseResponse getAdminPaymentList(int currentPage, int pageSize, String status, String keyword);

    BaseResponse getAdminPaymentDetail(UUID paymentId);

    /** Lets the admin order screen show the payment attached to an order. */
    BaseResponse getAdminPaymentByTransaction(UUID transactionId);

    BaseResponse getInboxCount();

    BaseResponse approvePayment(UUID paymentId);

    BaseResponse rejectPayment(UUID paymentId, RejectPaymentRequest request);

    /** Sweeps windows that lapsed without a confirmation. Returns how many were closed. */
    int expireOverduePayments();
}
