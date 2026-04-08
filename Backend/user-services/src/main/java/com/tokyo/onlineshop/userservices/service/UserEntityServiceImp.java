package com.tokyo.onlineshop.userservices.service;

import com.tokyo.onlineshop.userservices.Membership;
import com.tokyo.onlineshop.userservices.Purpose;
import com.tokyo.onlineshop.userservices.Status;
import com.tokyo.onlineshop.userservices.dto.RequestOtpDto;
import com.tokyo.onlineshop.userservices.dto.RegisterRequest;
import com.tokyo.onlineshop.userservices.entity.UserEntity;
import com.tokyo.onlineshop.userservices.repository.OtpVerificationRepository;
import com.tokyo.onlineshop.userservices.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class UserEntityServiceImp implements UserEntityService{

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpVerificationRepository otpVerificationRepo;

    @Override
    public void register(RegisterRequest request) {
        if(userRepository.existsByPhoneNumber(request.getPhoneNumber())){
            throw new RuntimeException("Nomor ini sudah terdaftar");
        }

        boolean otpVerified = otpVerificationRepo.existsByPhoneNumberAndPurposeAndUsedAtIsNotNull(
                request.getPhoneNumber(),
                Purpose.REGISTER
        );

        if (!otpVerified) {
            throw new RuntimeException("OTP belum diverifikasi");
        }

        UserEntity newUser = UserEntity.builder()
                .name(request.getName())
                .phoneNumber(request.getPhoneNumber())
                .addressList(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .pinHash(passwordEncoder.encode(request.getPin()))
                .membership(Membership.REGULAR)
                .phoneVerifiedAt(LocalDateTime.now())
                .status(Status.VERIFIED)
                .refreshTokenList(new ArrayList<>())
                .build();

        userRepository.save(newUser);


    }
}
