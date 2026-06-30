package com.tokyo.onlineshop.productservices.dto.response;

import com.tokyo.common.ProductionStatus;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class GetProductClientResponse {
    private UUID productId;
    private String productName;
    private ProductionStatus status;
    private String url;
}
