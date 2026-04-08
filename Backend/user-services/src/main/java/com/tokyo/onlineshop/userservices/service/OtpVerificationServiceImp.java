package com.tokyo.onlineshop.userservices.service;

import com.tokyo.onlineshop.userservices.Purpose;
import com.tokyo.onlineshop.userservices.dto.RequestOtpDto;
import com.tokyo.onlineshop.userservices.dto.VerifyOtpRequest;
import com.tokyo.onlineshop.userservices.entity.OtpVerification;
import com.tokyo.onlineshop.userservices.repository.OtpVerificationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;


@Service
@RequiredArgsConstructor
public class OtpVerificationServiceImp implements OtpVerificationService {

    private final PasswordEncoder passwordEncoder;
    private final OtpVerificationRepository otpVerificationRepo;
    private static final int MAX_ATTEMPTS = 5;
    private final OtpSender otpSender;

    @Override
    public void requestOtp(RequestOtpDto otpVerifiedRequest) {
        String code = generateOtp();
        OtpVerification otpVerification = OtpVerification.builder()
                .codeHash(passwordEncoder.encode(code))
                .phoneNumber(otpVerifiedRequest.getPhoneNumber())
                .purpose(Purpose.REGISTER)
                .resendCount(0)
                .attemptCount(0)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(3))
                .build();

        otpVerificationRepo.save(otpVerification);
        otpSender.sendOtp(otpVerifiedRequest.getPhoneNumber(),code);
    }

    @Transactional
    @Override
    public void verifiedUserOtpCode(VerifyOtpRequest response) {
        OtpVerification otp = otpVerificationRepo.findTopByPhoneNumberAndUsedAtIsNullAndPurposeOrderByIdDesc (response.getPhoneNumber(),Purpose.REGISTER)
                .orElseThrow(() -> new RuntimeException("No Otp Found"));

        if(otp.getExpiresAt().isBefore(LocalDateTime.now())){
            throw new RuntimeException("OTP code is Expired");
        }

        int currentCount = otp.getAttemptCount() == null ? 0 : otp.getAttemptCount();

        if(currentCount >= 3){
            throw new RuntimeException("OTP attemps limit reached");
        }

        if(!passwordEncoder.matches(response.getCode(),otp.getCodeHash())){
            otp.setAttemptCount(otp.getAttemptCount() + 1);
            otpVerificationRepo.save(otp);
            throw new RuntimeException("OTP code is not matches");
        }

        otp.setUsedAt(LocalDateTime.now());
        otpVerificationRepo.save(otp);
    }

    public String generateOtp(){
        int value = 100000 + new Random().nextInt(900000);
        return String.valueOf(value);
    }


}
