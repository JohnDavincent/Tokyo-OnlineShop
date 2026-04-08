package com.tokyo.onlineshop.userservices.service;

import com.tokyo.onlineshop.userservices.dto.RequestOtpDto;
import com.tokyo.onlineshop.userservices.dto.VerifyOtpRequest;

public interface OtpVerificationService {
    public void requestOtp(RequestOtpDto otpVerifiedRequest);
    public void verifiedUserOtpCode(VerifyOtpRequest otpVerifiedRequest);
}
