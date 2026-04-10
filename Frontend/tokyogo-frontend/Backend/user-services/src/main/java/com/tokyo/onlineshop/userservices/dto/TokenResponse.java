package com.tokyo.onlineshop.userservices.dto;

import com.tokyo.onlineshop.userservices.entity.RefreshToken;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
public record TokenResponse(
        String accessToken,
        String refreshToken
) {}
