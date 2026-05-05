package com.tokyoonlineshop.cartservices.dto;
import com.tokyo.common.ProductionStatus;

import lombok.*;
import org.springframework.web.bind.annotation.RequestParam;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetProductClientResponse {
    private String productName;
    private ProductionStatus status;
}
