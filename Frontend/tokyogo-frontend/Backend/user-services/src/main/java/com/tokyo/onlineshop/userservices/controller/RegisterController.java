package com.tokyo.onlineshop.userservices.controller;

import com.tokyo.onlineshop.userservices.dto.RegisterRequest;
import com.tokyo.onlineshop.userservices.dto.RequestOtpDto;
import com.tokyo.onlineshop.userservices.dto.VerifyOtpRequest;
import com.tokyo.onlineshop.userservices.service.OtpVerificationService;
import com.tokyo.onlineshop.userservices.service.UserEntityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/tokyo")
@RequiredArgsConstructor
@RestController
public class RegisterController {

    private final OtpVerificationService otpVerificationService;
    private final UserEntityService userEntityService;

    @PostMapping("/request-otp")
    ResponseEntity<String> requestOtp(@RequestBody RequestOtpDto request){
        otpVerificationService.requestOtp(request);
        return ResponseEntity.ok("OTP success Send");
    }

    @PostMapping("/verify-otp")
    ResponseEntity<String>verifyOtp(@RequestBody VerifyOtpRequest request){
        otpVerificationService.verifiedUserOtpCode(request);
        return ResponseEntity.ok("OTP verify Success");
    }

    @PostMapping("/register")
    ResponseEntity<String>register(@RequestBody RegisterRequest request){
        userEntityService.register(request);
        return ResponseEntity.ok("Register new User success!");
    }
}
