package com.tokyo.onlineshop.productservices.dto;

import com.tokyo.onlineshop.productservices.ImageStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor

public class CreateImageResponse {
    private String url;
    private String productName;
    private String altText;
    private Boolean isPrimary;
}

