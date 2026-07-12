package com.tokyo.onlineshop.productservices.dto.request;

import com.tokyo.onlineshop.productservices.enums.FlashSaleStatus;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashSaleRequest {

    @NotNull
    private UUID unitId;

    @NotNull
    @Future(message = "Flash sale expiry must be in the future")
    private LocalDateTime flashSaleEndDate;

    private LocalDateTime flashSaleStart;

    @NotNull
    private BigDecimal flashSalePrice;
}
