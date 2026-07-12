package com.tokyo.onlineshop.productservices.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListFlashSaleRequest {

    @NotNull
    private UUID unitId;

    @NotNull
    @Future(message = "Flash sale expiry must be in the future")
    private LocalDateTime flashSaleEndDate;

    private LocalDateTime flashSaleStart;

    @NotNull
    private BigDecimal flashSalePrice;
}
