package com.tokyoonlineshop.cartservices.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class CartListResponse {
    private List<CartListItemResponse> itemList;
    private BigDecimal grandTotal;
}
