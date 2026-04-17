package com.tokyo.onlineshop.productservices.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class CreateProductResponse {

    private String name;
    private String sku;
    private Integer stock;
    private Integer baseWeight;
    private String brand;
    private String category;
    private String subCategory;
    private String description;
    private List<CreateImageResponse> imageList;
    private List<CreateUnitResponse> unitList;
}
