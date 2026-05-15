package com.tokyo.onlineshop.transactionservices.service;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.onlineshop.transactionservices.dto.AddTransactionDetailRequest;
import com.tokyo.onlineshop.transactionservices.dto.AddTransactionDetailResponseDto;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public interface TransactionDetailService {
     List<AddTransactionDetailResponseDto> addTransactionDetail(UUID transactionId);
}
