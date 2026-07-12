package com.tokyo.onlineshop.productservices.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductOnFlashSaleResponse {
    private String productName;
    private unitInFlashSale flashSale;

    @Builder
    @Setter
    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class unitInFlashSale{
        private BigDecimal sellPrice;
        private BigDecimal flashSellPrice;
        private String startDate;
        private String endDate;
    }


}
