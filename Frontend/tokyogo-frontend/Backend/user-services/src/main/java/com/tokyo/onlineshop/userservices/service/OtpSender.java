package com.tokyo.onlineshop.userservices.service;

public interface OtpSender {
    void sendOtp(String phoneNumber, String otpCode);
}
