package com.tokyo.onlineshop.userservices.service;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.onlineshop.userservices.dto.request.CreateVoucherRequest;
import com.tokyo.onlineshop.userservices.dto.request.UpdateVoucherRequest;
import com.tokyo.onlineshop.userservices.dto.request.VoucherListFilter;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public interface VoucherService {

    BaseResponse createNewVoucher(CreateVoucherRequest request);

    BaseResponse updateVoucher(UUID voucherId, UpdateVoucherRequest request);

    BaseResponse voucherList(VoucherListFilter voucherListFilter);

}
