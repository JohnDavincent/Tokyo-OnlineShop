package com.tokyo.onlineshop.transactionservices.service;

import com.tokyo.common.dto.BaseResponse;

import java.util.UUID;

public class TransactionDetailServiceImp implements TransactionDetailService{
    @Override
    public BaseResponse addTransactionDetail(UUID cartId) {
        if(cartId == null){
            throw new RuntimeException("Cart is not found");
        }


    }
}
