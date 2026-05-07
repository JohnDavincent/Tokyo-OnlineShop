package com.tokyo.onlineshop.userservices.controller;

import com.tokyo.onlineshop.userservices.dto.GetProfileResponse;
import com.tokyo.onlineshop.userservices.dto.LoginRequest;
import com.tokyo.onlineshop.userservices.dto.RefreshTokenRequest;
import com.tokyo.onlineshop.userservices.dto.TokenResponse;
import com.tokyo.onlineshop.userservices.entity.RefreshToken;
import com.tokyo.onlineshop.userservices.entity.UserEntity;
import com.tokyo.onlineshop.userservices.repository.UserRepository;
import com.tokyo.onlineshop.userservices.service.JwtService;
import com.tokyo.onlineshop.userservices.service.RefreshTokenService;
import com.tokyo.onlineshop.userservices.service.Role;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/tokyo/api-auth")
public class AuthController {

    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    @PostMapping("/login")
    ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        UserEntity user = userRepository.findByPhoneNumber(request.getPhoneNumber()).orElseThrow(() -> new RuntimeException("login failed, Phone or pin is incorrect"));

        if (!passwordEncoder.matches(request.getPin(), user.getPinHash())) {
            throw new RuntimeException("Login failed, phone or pin is incorrect!");
        }

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getMembership(), Role.USER);
        String refreshToken = refreshTokenService.CreateRefreshToken(user);

        return ResponseEntity.ok(new TokenResponse(accessToken,refreshToken));
    }

    @PostMapping("/refresh")
    ResponseEntity<?> refresh(@Valid @RequestBody RefreshTokenRequest request){
        UserEntity user = refreshTokenService.verifyRefreshToken(request.getRefreshToken());

        refreshTokenService.revokeToken(request.getRefreshToken());

        String newAccessToken = jwtService.generateAccessToken(user.getId(), user.getMembership(),Role.USER);
        String newRefreshToken = refreshTokenService.CreateRefreshToken(user);

        return ResponseEntity.ok(new TokenResponse(newAccessToken,newRefreshToken));
    }


    @PostMapping("/delete")
    ResponseEntity<Void> logout(@Valid @RequestBody RefreshTokenRequest request){
        refreshTokenService.revokeToken(request.getRefreshToken());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    ResponseEntity<GetProfileResponse> profile(){
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userRepository.findById(UUID.fromString(userId)).orElseThrow(() -> new RuntimeException("User not found!!"));
        GetProfileResponse response = GetProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .phoneNumber(user.getPhoneNumber())
                .membership(user.getMembership())
                .build();

        return ResponseEntity.ok(response);
    }


}
