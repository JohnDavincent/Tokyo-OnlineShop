package com.tokyo.onlineshop.productservices.dto;

import com.tokyo.onlineshop.productservices.ProductionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class ProductCard {
    private String productName;
    private ProductionStatus status;
    private String url;
    private String altText;
    private String category;
    private List<CreateUnitResponse> unitList;


}
