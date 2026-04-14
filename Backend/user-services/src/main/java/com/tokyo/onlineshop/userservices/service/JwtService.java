package com.tokyo.onlineshop.userservices.service;

import com.tokyo.onlineshop.userservices.Membership;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Service
public class JwtService  {
    private final SecretKey secretKey;
    private final Long accessTokenExpirationMinutes;

    public JwtService(
            @Value("${app.jwt.secret}")
            String secret,

            @Value("${app.jwt.access-token.expiration-minutes}")
            long accessTokenExpirationMinutes
    ){
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpirationMinutes = accessTokenExpirationMinutes;
    }

    public String generateAccessToken(UUID userId, Membership membership, Role role){
        Instant now = Instant.now();

        return Jwts.builder()
                .setSubject(userId.toString())
                .claim("membership",membership.name())
                .claim("role",role.name())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(accessTokenExpirationMinutes * 60)))
                .signWith(secretKey)
                .compact();
    }

    public Claims extractClaims(String token){
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean isTokenValid(String token){
        try{
            extractClaims(token);
            return true;
        }catch (Exception e){
            return false;
        }
    }

    public UUID extractUserId(String token){
        String userId = extractClaims(token).getSubject();
        return UUID.fromString(userId);
    }

    public String extractSubject(String token) {
        return extractClaims(token).getSubject();
    }

    public Role extractRole(String token) {
        return Role.valueOf(extractClaims(token).get("role", String.class));
    }

    public String generateTokenAdmin(String email,Role role){
        Instant now = Instant.now();
        return Jwts.builder()
                .claim("role", role.name())
                .setSubject(email)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(accessTokenExpirationMinutes * 60)))
                .signWith(secretKey)
                .compact();
    }
}
