package com.tokyo.onlineshop.productservices.dto;

import com.tokyo.onlineshop.productservices.ImageStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

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

    private UUID brand;

    private UUID category;

    private String subCategory;

    private String description;

    List<CreateUnitRequest> unitList;

    List<CreateImageRequest> imageList;


}
