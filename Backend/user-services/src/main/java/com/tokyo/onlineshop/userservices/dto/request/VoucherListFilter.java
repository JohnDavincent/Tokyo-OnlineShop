package com.tokyo.onlineshop.userservices.dto.request;

import com.tokyo.common.dto.PagingRequest;
import com.tokyo.onlineshop.userservices.DiscountType;
import com.tokyo.onlineshop.userservices.VoucherAudience;
import com.tokyo.onlineshop.userservices.VoucherStatus;
import com.tokyo.onlineshop.userservices.VoucherType;
import lombok.*;

import java.time.LocalDateTime;

@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class VoucherListFilter extends PagingRequest {
    private String search;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private DiscountType discountType;
    private VoucherStatus voucherStatus;
    private VoucherType voucherType;
    private VoucherAudience audience;
    private String code;
}
