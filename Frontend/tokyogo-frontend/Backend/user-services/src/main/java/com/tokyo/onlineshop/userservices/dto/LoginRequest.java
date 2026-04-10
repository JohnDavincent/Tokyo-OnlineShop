package com.tokyo.onlineshop.userservices.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class LoginRequest {
    @NotBlank
    @Size(min = 10, max = 15)
    private String phoneNumber;

    private String pin;
}
