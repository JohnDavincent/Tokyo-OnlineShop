package com.tokyo.onlineshop.userservices.dto.response;

import com.tokyo.onlineshop.userservices.DiscountType;
import com.tokyo.onlineshop.userservices.VoucherAudience;
import com.tokyo.onlineshop.userservices.VoucherStatus;
import com.tokyo.onlineshop.userservices.VoucherType;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Builder
public record VoucherDto(
        UUID id,
        String code,
        String title,
        String description,
        VoucherType voucherType,
        DiscountType discountType,
        BigDecimal value,
        VoucherAudience audience,
        VoucherStatus voucherStatus,
        LocalDateTime startAt,
        LocalDateTime endAt,
        Integer totalQuote,
        Integer usedCount,
        Integer usageLimit,
        Map<String, Object> criteria,

        // ---- field buat debugging (dari BaseEntity) ----
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
