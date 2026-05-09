package com.tokyo.onlineshop.userservices.controller;

import com.tokyo.onlineshop.userservices.dto.GetProfileResponse;
import com.tokyo.onlineshop.userservices.dto.LoginRequest;
import com.tokyo.onlineshop.userservices.dto.RefreshTokenRequest;
import com.tokyo.onlineshop.userservices.dto.TokenResponse;
import com.tokyo.onlineshop.userservices.entity.UserEntity;
import com.tokyo.onlineshop.userservices.repository.UserRepository;
import com.tokyo.onlineshop.userservices.service.JwtService;
import com.tokyo.onlineshop.userservices.service.RefreshTokenService;
import com.tokyo.onlineshop.userservices.service.Role;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/tokyo/api-auth")
@Tag(name = "Authentication", description = "User authentication, token refresh, and profile operations")
public class AuthController {

    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Operation(
            summary = "User login",
            description = "### Section: Authentication\n" +
                    "**Request:** Authenticate a user with phone number and PIN.\n" +
                    "**Response:** Returns access token and refresh token for session management."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login successful",
                    content = @Content(schema = @Schema(implementation = TokenResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "401", description = "Invalid phone number or PIN")
    })
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        UserEntity user = userRepository.findByPhoneNumber(request.getPhoneNumber()).orElseThrow(() -> new RuntimeException("login failed, Phone or pin is incorrect"));

        if (!passwordEncoder.matches(request.getPin(), user.getPinHash())) {
            throw new RuntimeException("Login failed, phone or pin is incorrect!");
        }

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getMembership(), Role.USER);
        String refreshToken = refreshTokenService.CreateRefreshToken(user);

        return ResponseEntity.ok(new TokenResponse(accessToken, refreshToken));
    }

    @Operation(
            summary = "Refresh access token",
            description = "### Section: Authentication\n" +
                    "**Request:** Exchange a valid refresh token for a new access token and refresh token pair.\n" +
                    "**Response:** Returns new access token and refresh token."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Token refreshed successfully",
                    content = @Content(schema = @Schema(implementation = TokenResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid refresh token request"),
            @ApiResponse(responseCode = "401", description = "Refresh token is invalid or expired")
    })
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        UserEntity user = refreshTokenService.verifyRefreshToken(request.getRefreshToken());

        refreshTokenService.revokeToken(request.getRefreshToken());

        String newAccessToken = jwtService.generateAccessToken(user.getId(), user.getMembership(), Role.USER);
        String newRefreshToken = refreshTokenService.CreateRefreshToken(user);

        return ResponseEntity.ok(new TokenResponse(newAccessToken, newRefreshToken));
    }

    @Operation(
            summary = "Logout",
            description = "### Section: Authentication\n" +
                    "**Request:** Revoke the provided refresh token to end the user session.\n" +
                    "**Response:** Returns HTTP 204 No Content on successful logout."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Logout successful - refresh token revoked"),
            @ApiResponse(responseCode = "400", description = "Invalid refresh token request")
    })
    @PostMapping("/delete")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshTokenRequest request) {
        refreshTokenService.revokeToken(request.getRefreshToken());
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Get user profile",
            description = "### Section: Authentication\n" +
                    "**Request:** Retrieve the authenticated user's profile information.\n" +
                    "**Response:** Returns GetProfileResponse containing user ID, name, phone number, membership, and addresses."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Profile retrieved successfully",
                    content = @Content(schema = @Schema(implementation = GetProfileResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token missing or invalid"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/me")
    public ResponseEntity<GetProfileResponse> profile() {
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
