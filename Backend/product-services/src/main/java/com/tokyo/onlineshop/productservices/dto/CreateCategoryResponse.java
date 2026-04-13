package com.tokyo.onlineshop.productservices.dto;

import com.tokyo.onlineshop.productservices.ProductionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class CreateCategoryResponse {
    private UUID id;
    private String slug;
    private String ParentCategory;
    private ProductionStatus status;

}
