package com.tokyo.onlineshop.userservices.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateAddressRequest {
    @Size(min = 10)
    @NotBlank
    private String fullAddress;

    @NotBlank
    private String province;

    private String notes;

    @NotBlank
    @Size(min = 5)
    private String recipientName;

    @NotBlank
    private String recipientPhone;

    @NotBlank
    private String city;

    @NotBlank
    private String postalCode;
}
