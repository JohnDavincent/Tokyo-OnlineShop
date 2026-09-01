package com.tokyo.onlineshop.transactionservices.service;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.common.event.PaymentCompletedEvent;

import java.util.UUID;

public interface TransactionService {

    public BaseResponse createTransaction(UUID addressId);
    public BaseResponse getTransactionList(int currentPage, int pageSize, String startDate, String endDate);
    public BaseResponse getTransactionDetail(UUID transactionId);
    public BaseResponse getAdminTransactionList(int currentPage, int pageSize, String startDate, String endDate, String status, String keyword);
    public BaseResponse getAdminTransactionDetail(UUID transactionId);

    /**
     * Moves an order to its final status once payment-services has settled the payment.
     * This is the only path to SUCCESS / FAILED / EXPIRED.
     */
    public void applyPaymentOutcome(PaymentCompletedEvent event);
}
