package com.tokyo.onlineshop.productservices.dto;

import com.tokyo.onlineshop.productservices.ImageStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateImageRequest {
    private String url;
    private String altText;

}
