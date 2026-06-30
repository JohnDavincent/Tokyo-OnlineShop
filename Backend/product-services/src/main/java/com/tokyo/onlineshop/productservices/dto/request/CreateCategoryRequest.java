package com.tokyo.onlineshop.productservices.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class CreateCategoryRequest {
    private String name;
    private UUID parent_id;
}
