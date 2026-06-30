package com.tokyo.onlineshop.productservices.dto.request;

import jakarta.validation.constraints.Future;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashSaleRequest {

    @Future(message = "Flash sale expiry must be in the future")
    private LocalDateTime flashSaleUntil;
    List<ProductFlashSaleDto> unitsSale;

    @Builder
    @Setter
    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProductFlashSaleDto{
        private String unit;
        private BigDecimal discountPrice;
    }
}
