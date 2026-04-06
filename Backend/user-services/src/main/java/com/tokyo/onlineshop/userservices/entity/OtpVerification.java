package com.tokyo.onlineshop.userservices.entity;


import com.tokyo.onlineshop.userservices.Purpose;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "otp_verification")
public class OtpVerification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "Purpose")
    private Purpose purpose;

    @Column(name = "resend_count")
    private Integer resendCount;

    @Column(name = "attempt_count")
    private Integer attemptCount;

    @Column(name = "used_at")
    private LocalDateTime usedAt;
}
