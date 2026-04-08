package com.tokyo.onlineshop.userservices.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class LoggingOtpSender implements OtpSender {


    @Override
    public void sendOtp(String phoneNumber, String otpCode) {
        log.info("OTP for {} is {}", phoneNumber,otpCode);
    }
}
