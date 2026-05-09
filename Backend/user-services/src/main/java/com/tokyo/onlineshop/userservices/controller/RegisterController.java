package com.tokyo.onlineshop.userservices.controller;

import com.tokyo.onlineshop.userservices.dto.RegisterRequest;
import com.tokyo.onlineshop.userservices.dto.RequestOtpDto;
import com.tokyo.onlineshop.userservices.dto.VerifyOtpRequest;
import com.tokyo.onlineshop.userservices.service.OtpVerificationService;
import com.tokyo.onlineshop.userservices.service.UserEntityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/tokyo")
@RequiredArgsConstructor
@RestController
@Tag(name = "Registration", description = "User registration and OTP verification operations")
public class RegisterController {

    private final OtpVerificationService otpVerificationService;
    private final UserEntityService userEntityService;

    @Operation(
            summary = "Request OTP",
            description = "### Section: Registration\n" +
                    "**Request:** Send an OTP code to the user's phone number for verification.\n" +
                    "**Response:** Returns success message confirming OTP delivery."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "OTP sent successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid phone number or rate limit exceeded")
    })
    @PostMapping("/request-otp")
    public ResponseEntity<String> requestOtp(@RequestBody RequestOtpDto request) {
        otpVerificationService.requestOtp(request);
        return ResponseEntity.ok("OTP success Send");
    }

    @Operation(
            summary = "Verify OTP",
            description = "### Section: Registration\n" +
                    "**Request:** Verify the OTP code entered by the user.\n" +
                    "**Response:** Returns success message confirming OTP verification."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "OTP verified successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid or expired OTP code")
    })
    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody VerifyOtpRequest request) {
        otpVerificationService.verifiedUserOtpCode(request);
        return ResponseEntity.ok("OTP verify Success");
    }

    @Operation(
            summary = "Register user",
            description = "### Section: Registration\n" +
                    "**Request:** Register a new user account after OTP verification with name, PIN, and phone number.\n" +
                    "**Response:** Returns success message confirming user registration."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User registered successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload or phone number already registered")
    })
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        userEntityService.register(request);
        return ResponseEntity.ok("Register new User success!");
    }
}
