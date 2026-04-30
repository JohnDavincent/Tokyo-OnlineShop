package com.tokyo.onlineshop.productservices.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class ProductFilterRequestDto {
    private UUID categoryParentId;
    private UUID subCategoryId;
    private String search;
}
