package com.tokyo.onlineshop.productservices.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateProductRequest {
    @NotBlank
    @Size(min = 3)
    private String name;

    @NotBlank
    @Size(min = 3)
    private String sku;

    @Positive
    private Integer stock;

    @Positive
    private Integer baseWeight;



}
