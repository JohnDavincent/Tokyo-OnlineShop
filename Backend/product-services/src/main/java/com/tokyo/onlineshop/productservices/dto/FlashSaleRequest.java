package com.tokyo.onlineshop.productservices.dto;

import jakarta.validation.constraints.Future;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashSaleRequest {

    @Future(message = "Flash sale expiry must be in the future")
    private LocalDateTime flashSaleUntil;
}
