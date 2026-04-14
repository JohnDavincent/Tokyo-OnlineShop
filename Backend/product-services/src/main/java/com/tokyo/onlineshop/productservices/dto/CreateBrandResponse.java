package com.tokyo.onlineshop.productservices.dto;

import com.tokyo.onlineshop.productservices.ProductionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class CreateBrandResponse {
    private String name;
    private String slug;
    private ProductionStatus status;
    private LocalDateTime createdAt;
    private String createdBy;
}
