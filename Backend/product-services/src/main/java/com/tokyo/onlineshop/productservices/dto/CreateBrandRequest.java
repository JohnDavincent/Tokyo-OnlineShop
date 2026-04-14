package com.tokyo.onlineshop.productservices.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@AllArgsConstructor
@RequiredArgsConstructor
@Builder

public class CreateBrandRequest {
    @NotBlank
    @Size(min = 2)
    private String name;
}
