package com.tokyo.onlineshop.productservices.dto.response;

import com.tokyo.common.ProductionStatus;
import com.tokyo.onlineshop.productservices.enums.FlashSaleStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FlashSaleResponse {
    private String productName;
    private boolean isFlashSale;
    private List<UnitResponse> units;


    @Builder
    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UnitResponse{
        private String unit;
        private LocalDateTime flashSaleUntil;
        private FlashSaleStatus status;
        private LocalDateTime flashSaleStart;
        private BigDecimal originalPrice;
        private BigDecimal flashSalePrice;
    }

}
