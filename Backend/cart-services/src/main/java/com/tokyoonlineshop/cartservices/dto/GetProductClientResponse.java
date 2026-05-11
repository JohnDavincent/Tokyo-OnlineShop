package com.tokyoonlineshop.cartservices.dto;
import com.tokyo.common.ProductionStatus;

import lombok.*;

import java.util.UUID;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetProductClientResponse {
    private UUID productId;
    private String productName;
    private ProductionStatus status;
    private String url;
}
