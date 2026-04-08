package com.tokyo.onlineshop.userservices.repository;

import com.tokyo.onlineshop.userservices.Purpose;
import com.tokyo.onlineshop.userservices.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, UUID> {

    @Query(
            """
            SELECT ov
            FROM OtpVerification ov
            WHERE ov.phoneNumber = :phoneNumber 
            AND ov.usedAt  IS NULL 
            AND ov.purpose = :purpose
            ORDER BY ov.UsedAt DESC
            LIMIT 1
            """
    )
    Optional<OtpVerification> findLatestOtpCode(@Param("phoneNumber") String phoneNumber, @Param("purpose")Purpose purpose);

    boolean existsByPhoneNumberAndPurposeAndUsedAtIsNotNull(
            String phoneNumber,
            Purpose purpose
    );

}
