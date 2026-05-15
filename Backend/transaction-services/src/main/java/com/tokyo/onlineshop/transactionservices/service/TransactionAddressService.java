package com.tokyo.onlineshop.transactionservices.service;


import com.tokyo.common.dto.BaseResponse;
import com.tokyo.onlineshop.transactionservices.dto.AddTransactionAddressResponseDto;
import com.tokyo.onlineshop.transactionservices.dto.GetUserAddressDto;

import java.util.List;
import java.util.UUID;

public interface TransactionAddressService {

    AddTransactionAddressResponseDto getUserAddress(UUID transactionId,UUID addressId);
}
