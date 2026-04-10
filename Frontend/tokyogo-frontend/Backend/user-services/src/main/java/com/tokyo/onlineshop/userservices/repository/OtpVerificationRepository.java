package com.tokyo.onlineshop.userservices.repository;

import com.tokyo.onlineshop.userservices.Purpose;
import com.tokyo.onlineshop.userservices.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, UUID> {

    Optional<OtpVerification> findTopByPhoneNumberAndUsedAtIsNullAndPurposeOrderByIdDesc(
            String phoneNumber,
            Purpose purpose
    );

    boolean existsByPhoneNumberAndPurposeAndUsedAtIsNotNull(
            String phoneNumber,
            Purpose purpose
    );

}
