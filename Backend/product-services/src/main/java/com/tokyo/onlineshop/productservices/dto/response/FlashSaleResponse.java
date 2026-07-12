package com.tokyo.onlineshop.productservices.dto.response;

import com.tokyo.common.ProductionStatus;
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
    private LocalDateTime flashSaleUntil;
    private String productName;
    private boolean isFlashSale;
    private ProductionStatus status;
    private List<UnitResponse> units;


    @Builder
    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UnitResponse{
        private String unit;
        private BigDecimal originalFlashSale;
        private BigDecimal flashSalePrice;
    }

}
