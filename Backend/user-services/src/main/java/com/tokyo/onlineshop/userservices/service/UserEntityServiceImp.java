package com.tokyo.onlineshop.userservices.service;

import com.tokyo.onlineshop.userservices.Membership;
import com.tokyo.onlineshop.userservices.Purpose;
import com.tokyo.onlineshop.userservices.Status;
import com.tokyo.onlineshop.userservices.dto.RequestOtpDto;
import com.tokyo.onlineshop.userservices.dto.RegisterRequest;
import com.tokyo.onlineshop.userservices.dto.UserDataResponse;
import com.tokyo.onlineshop.userservices.entity.Address;
import com.tokyo.onlineshop.userservices.entity.UserEntity;
import com.tokyo.onlineshop.userservices.repository.AddressRepository;
import com.tokyo.onlineshop.userservices.repository.OtpVerificationRepository;
import com.tokyo.onlineshop.userservices.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserEntityServiceImp implements UserEntityService{

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpVerificationRepository otpVerificationRepo;
    private final AddressRepository addressRepository;

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

    @Override
    public UserDataResponse getUserProfile() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        if(userId == null){
            throw new RuntimeException("User not found");
        }

        UserEntity user = userRepository.findById(UUID.fromString(userId)).orElseThrow(() -> new RuntimeException("User not found"));
        List<String> listAddressList = addressRepository.listAllUserAddress(UUID.fromString(userId));
        return  UserDataResponse.builder()
                .username(user.getName())
                .membership(user.getMembership())
                .phoneNumber(user.getPhoneNumber())
                .address(listAddressList)
                .build();
    }
}
