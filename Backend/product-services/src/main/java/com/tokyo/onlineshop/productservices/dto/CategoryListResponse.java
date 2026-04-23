package com.tokyo.onlineshop.productservices.dto;

import lombok.Builder;

import java.util.UUID;


@Builder
public class CategoryListResponse {
    private UUID id;
    private String categoryName;
    private String imageUrl;
    private String altText;
}
