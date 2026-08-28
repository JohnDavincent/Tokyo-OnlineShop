package com.tokyo.onlineshop.userservices.dto.response;

import com.tokyo.onlineshop.userservices.DiscountType;
import com.tokyo.onlineshop.userservices.VoucherStatus;
import com.tokyo.onlineshop.userservices.VoucherType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class VoucherListResponse {
    private UUID voucherId;
    private String voucherTitle;
    private String voucherCode;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private DiscountType discountType;
    private VoucherStatus voucherStatus;
    private VoucherType voucherType;

}
