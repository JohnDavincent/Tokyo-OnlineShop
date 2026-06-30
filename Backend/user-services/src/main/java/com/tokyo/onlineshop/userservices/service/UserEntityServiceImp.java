package com.tokyo.onlineshop.userservices.service;

import com.tokyo.common.exception.BadRequestException;
import com.tokyo.common.exception.ConflictException;
import com.tokyo.common.exception.NotFoundException;
import com.tokyo.onlineshop.userservices.Membership;
import com.tokyo.onlineshop.userservices.Purpose;
import com.tokyo.onlineshop.userservices.Status;
import com.tokyo.onlineshop.userservices.dto.RegisterRequest;
import com.tokyo.onlineshop.userservices.dto.UserDataResponse;
import com.tokyo.onlineshop.userservices.entity.Address;
import com.tokyo.onlineshop.userservices.entity.OtpVerification;
import com.tokyo.onlineshop.userservices.entity.UserEntity;
import com.tokyo.onlineshop.userservices.repository.AddressRepository;
import com.tokyo.onlineshop.userservices.repository.OtpVerificationRepository;
import com.tokyo.onlineshop.userservices.repository.UserRepository;
import jakarta.transaction.Transactional;
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

    @Transactional
    @Override
    public void register(RegisterRequest request) {
        Optional<UserEntity> existingUser = userRepository.findByPhoneNumber(request.getPhoneNumber());

        if(existingUser.isPresent() && existingUser.get().getStatus() == Status.VERIFIED && existingUser.get().getPhoneVerifiedAt() != null){
            throw new ConflictException("Nomor ini sudah terdaftar");
        }

        OtpVerification latestOtp = otpVerificationRepo.findTopByPhoneNumberAndPurposeOrderByCreatedAtDesc(
                request.getPhoneNumber(),
                Purpose.REGISTER
        ).orElseThrow(() -> new BadRequestException("OTP belum diverifikasi"));

        if (latestOtp.getUsedAt() == null) {
            throw new BadRequestException("OTP belum diverifikasi");
        }

        LocalDateTime now = LocalDateTime.now();
        UserEntity newUser = existingUser.orElseGet(UserEntity::new);
        newUser.setName(request.getName());
        newUser.setPhoneNumber(request.getPhoneNumber());
        newUser.setCreatedAt(newUser.getCreatedAt() == null ? now : newUser.getCreatedAt());
        newUser.setPinHash(passwordEncoder.encode(request.getPin()));
        newUser.setMembership(Membership.REGULAR);
        newUser.setPhoneVerifiedAt(now);
        newUser.setStatus(Status.VERIFIED);

        if (newUser.getAddressList() == null) {
            newUser.setAddressList(new ArrayList<>());
        }

        if (newUser.getRefreshTokenList() == null) {
            newUser.setRefreshTokenList(new ArrayList<>());
        }

        userRepository.save(newUser);

    }

    @Override
    public UserDataResponse getUserProfile() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        if(userId == null){
            throw new NotFoundException("User not found");
        }

        UserEntity user = userRepository.findById(UUID.fromString(userId)).orElseThrow(() -> new NotFoundException("User not found"));
        List<String> listAddressList = addressRepository.listAllUserAddress(UUID.fromString(userId));
        return  UserDataResponse.builder()
                .username(user.getName())
                .membership(user.getMembership())
                .phoneNumber(user.getPhoneNumber())
                .address(listAddressList)
                .build();
    }
}
