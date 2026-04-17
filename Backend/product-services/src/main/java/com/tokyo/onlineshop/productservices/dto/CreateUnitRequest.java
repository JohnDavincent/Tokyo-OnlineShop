package com.tokyo.onlineshop.productservices.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data

public class CreateUnitRequest {

    @NotBlank
    private String unit;

    @Positive
    @NotNull
    private Integer convertQuantity;

    @Positive
    @NotNull
    private BigDecimal basePrice;

    @Positive
    @NotNull
    private BigDecimal sellPrice;

}
