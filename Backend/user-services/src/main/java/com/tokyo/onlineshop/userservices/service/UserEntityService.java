package com.tokyo.onlineshop.userservices.service;

import com.tokyo.onlineshop.userservices.dto.RegisterRequest;
import com.tokyo.onlineshop.userservices.dto.UserDataResponse;

public interface UserEntityService {
    public void register(RegisterRequest request);
    public UserDataResponse getUserProfile();
}
