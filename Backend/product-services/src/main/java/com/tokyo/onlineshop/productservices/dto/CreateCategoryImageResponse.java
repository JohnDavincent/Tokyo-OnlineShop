package com.tokyo.onlineshop.productservices.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreateCategoryImageResponse {
    private String imageUrl;
    private String categoryName;

}
