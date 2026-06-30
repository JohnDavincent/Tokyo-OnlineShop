package com.tokyo.onlineshop.productservices.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor

public class CreateImageResponse {
    private String url;
    private String productName;
    private String altText;
    private Boolean isPrimary;
    private String slug;
}

