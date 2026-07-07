package com.tokyo.onlineshop.productservices.dto.response;

import com.tokyo.common.ProductionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class CreateBrandResponse {
    private UUID id;
    private String name;
    private String slug;
    private ProductionStatus status;
    private LocalDateTime createdAt;
    private String createdBy;
}
