package com.tokyo.onlineshop.userservices.service;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.onlineshop.userservices.dto.request.CreateVoucherRequest;
import com.tokyo.onlineshop.userservices.dto.request.UpdateVoucherRequest;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public interface VoucherService {

    BaseResponse createNewVoucher(CreateVoucherRequest request);

    BaseResponse updateVoucher(UUID voucherId, UpdateVoucherRequest request);

}
