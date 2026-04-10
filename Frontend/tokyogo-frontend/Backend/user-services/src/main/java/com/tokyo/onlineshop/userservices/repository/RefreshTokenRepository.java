package com.tokyo.onlineshop.userservices.repository;

import com.tokyo.onlineshop.userservices.entity.RefreshToken;
import com.tokyo.onlineshop.userservices.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    public void deleteByUser(UserEntity user);
    public Optional<RefreshToken> findByTokenHash(String token);
}
