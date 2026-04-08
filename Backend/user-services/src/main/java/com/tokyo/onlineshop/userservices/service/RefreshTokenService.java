package com.tokyo.onlineshop.userservices.service;

import com.tokyo.onlineshop.userservices.entity.RefreshToken;
import com.tokyo.onlineshop.userservices.entity.UserEntity;

public interface RefreshTokenService{

    public String CreateRefreshToken(UserEntity user);
    public UserEntity verifyRefreshToken(String token);
    public void revokeToken(String token);
}
