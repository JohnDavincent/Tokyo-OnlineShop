package com.tokyo.onlineshop.userservices.service;

import com.tokyo.onlineshop.userservices.entity.RefreshToken;
import com.tokyo.onlineshop.userservices.entity.UserEntity;
import com.tokyo.onlineshop.userservices.repository.RefreshTokenRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HexFormat;
import java.util.UUID;

import static java.util.Objects.hash;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImp implements RefreshTokenService{

    ZoneId zone = ZoneId.of("Asia/Jakarta");

    @Value("${app.jwt.refresh-token.expiration-days}")
    private long refreshTokenExpirationDays;

    private final RefreshTokenRepository refreshTokenRepository;
    private PasswordEncoder passwordEncoder;


    @Override
    public String CreateRefreshToken(UserEntity user) {
        refreshTokenRepository.deleteByUser(user);

        String rawToken = UUID.randomUUID() + "." + UUID.randomUUID();

        RefreshToken createToken = RefreshToken.builder()
                .user(user)
                .tokenHash(hash(rawToken))
                .expiredAt(LocalDateTime.now().plusDays(refreshTokenExpirationDays))
                .revoke(false)
                .createdAt(Instant.now().atZone(zone).toLocalDateTime())
                .build();

        user.getRefreshTokenList().add(createToken);
        refreshTokenRepository.save(createToken);
        return rawToken;
    }

    @Override
    public UserEntity verifyRefreshToken(String token) {
       RefreshToken refreshToken =  refreshTokenRepository.findByTokenHash(hash(token)).orElseThrow(() -> new RuntimeException("Token not found"));

        if(refreshToken.isRevoke()){
            throw new RuntimeException("Refresh token has been revoked");
        }

        if(refreshToken.getExpiredAt().isBefore(Instant.now().atZone(zone).toLocalDateTime())){
           refreshTokenRepository.delete(refreshToken);
           throw new RuntimeException("Refresh token has expired");
       }

        return refreshToken.getUser();
    }

    @Override
    public void revokeToken(String rawToken) {
        RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(hash(rawToken)).orElseThrow(() -> new RuntimeException("Refresh token Not found!"));
        refreshToken.setRevoke(true);
        refreshToken.setRevokeAt(LocalDateTime.now());
        refreshTokenRepository.save(refreshToken);
    }


    private String hash(String rawToken){
        try{
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        }catch (Exception e){
            throw new IllegalStateException("Failed to hash refresh token", e);
        }
    }


}
