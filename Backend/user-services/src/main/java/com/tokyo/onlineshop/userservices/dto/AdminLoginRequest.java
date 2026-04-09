package com.tokyo.onlineshop.userservices.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data

public class AdminLoginRequest {
    private String email;
    private String password;
}
