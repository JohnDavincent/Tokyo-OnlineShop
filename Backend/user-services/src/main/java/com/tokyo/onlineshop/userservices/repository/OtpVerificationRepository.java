package com.tokyo.onlineshop.userservices.repository;

import com.tokyo.onlineshop.userservices.Purpose;
import com.tokyo.onlineshop.userservices.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, UUID> {

    Optional<OtpVerification> findTopByPhoneNumberAndUsedAtIsNullAndPurposeOrderByCreatedAtDesc(
            String phoneNumber,
            Purpose purpose
    );

    Optional<OtpVerification> findTopByPhoneNumberAndPurposeOrderByCreatedAtDesc(
            String phoneNumber,
            Purpose purpose
    );

    @Modifying
    @Query("update OtpVerification otp set otp.expiresAt = :expiresAt " +
            "where otp.phoneNumber = :phoneNumber and otp.purpose = :purpose and otp.usedAt is null")
    int expireUnusedOtps(
            @Param("phoneNumber") String phoneNumber,
            @Param("purpose") Purpose purpose,
            @Param("expiresAt") LocalDateTime expiresAt
    );

    boolean existsByPhoneNumberAndPurposeAndUsedAtIsNotNull(
            String phoneNumber,
            Purpose purpose
    );

}
