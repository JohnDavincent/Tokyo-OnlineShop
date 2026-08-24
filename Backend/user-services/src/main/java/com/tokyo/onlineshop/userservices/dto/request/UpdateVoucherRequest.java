package com.tokyo.onlineshop.userservices.dto.request;

import com.tokyo.onlineshop.userservices.DiscountType;
import com.tokyo.onlineshop.userservices.VoucherAudience;
import com.tokyo.onlineshop.userservices.VoucherType;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Partial update: field yang null = jangan diubah (tetap pakai nilai lama di DB).
 */
@Builder
public record UpdateVoucherRequest(
        String title,
        String description,
        VoucherType voucherType,
        DiscountType discountType,
        BigDecimal value,
        LocalDateTime startAt,
        LocalDateTime endAt,
        Integer totalQuote,
        Integer usageLimit,

        Double minimalSpend,
        Double maximumDiscount,
        Integer minQuantity,
        List<String> applicableProductId,
        List<String> applicableCategoryId,
        VoucherAudience audience
) {
}
