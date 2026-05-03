package com.tokyo.onlineshop.productservices.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductFilterRequestDto {
    private UUID categoryParentId;
    private UUID subCategoryId;
    private String search;
}
