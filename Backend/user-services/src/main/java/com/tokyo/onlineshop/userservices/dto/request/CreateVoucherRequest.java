package com.tokyo.onlineshop.userservices.dto.request;

import com.tokyo.onlineshop.userservices.DiscountType;
import com.tokyo.onlineshop.userservices.VoucherAudience;
import com.tokyo.onlineshop.userservices.VoucherType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;


@Builder
public record CreateVoucherRequest(
        String title,
        String description,
        VoucherType voucherType,
        DiscountType discountType,

        @Positive(message = "Nilai harus lebih dari 0")
        BigDecimal value,
        @NotNull(message = "Harus milih waktu mulai")
        LocalDateTime startAt,

        LocalDateTime endAt,
        Integer totalQuote,
        Integer usageLimit,
        String code,
        Double minimalSpend,
        Double maximumDiscount,
        Integer minQuantity,
        List<String> applicableProductId,
        List<String> applicableCategoryId,
        @NotNull(message =  "Tentukan siapa aja yang boleh dapat vouchernya")
        VoucherAudience audience
) {
}
