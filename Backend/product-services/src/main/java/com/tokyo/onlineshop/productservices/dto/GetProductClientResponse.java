package com.tokyo.onlineshop.productservices.dto;

import com.tokyo.common.ProductionStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GetProductClientResponse {
    private String productName;
    private ProductionStatus status;
}
