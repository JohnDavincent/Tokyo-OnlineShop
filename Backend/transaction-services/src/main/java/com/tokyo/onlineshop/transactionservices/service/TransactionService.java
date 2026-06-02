package com.tokyo.onlineshop.transactionservices.service;

import com.tokyo.common.dto.BaseResponse;

import java.util.UUID;

public interface TransactionService {

    public BaseResponse createTransaction(UUID addressId);
    public BaseResponse getTransactionList(int currentPage, int pageSize, String startDate, String endDate);
    public BaseResponse getTransactionDetail(UUID transactionId);
}
