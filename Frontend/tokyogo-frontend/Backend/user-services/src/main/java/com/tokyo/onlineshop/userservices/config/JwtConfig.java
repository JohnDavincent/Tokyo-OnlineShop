package com.tokyo.onlineshop.userservices.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JwtConfig {
    @Value("${app.jwt.secret}")
    private String secret_key;

    @Value("${app.jwt.access-token.expiration-minutes}")
    private long accessTokenExpiration;

    @Value("${app.jwt.refresh-token.expiration-days}")
    private long refreshTokenExpiration;
}
