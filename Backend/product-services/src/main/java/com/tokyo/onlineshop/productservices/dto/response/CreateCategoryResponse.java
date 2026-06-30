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

public class CreateCategoryResponse {
    private UUID id;
    private String slug;
    private UUID ParentCategory;
    private ProductionStatus status;
    private String imageUrl;
    private LocalDateTime createdAt;
    private String created_by;


}
