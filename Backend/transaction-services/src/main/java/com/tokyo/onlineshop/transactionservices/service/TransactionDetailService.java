package com.tokyo.onlineshop.transactionservices.service;

import com.tokyo.common.dto.BaseResponse;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public interface TransactionDetailService {
    BaseResponse addTransactionDetail(UUID cartId);
}
