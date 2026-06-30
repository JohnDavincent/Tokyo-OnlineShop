package com.tokyo.onlineshop.productservices.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;


@Builder
@Data
public class CategoryListResponse {
    private UUID id;
    private String categoryName;
    private String imageUrl;
    private String altText;
}
