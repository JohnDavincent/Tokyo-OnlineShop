package com.tokyo.onlineshop.userservices.dto;

import com.tokyo.onlineshop.userservices.Membership;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class GetProfileResponse {
    private UUID id;
    private String name;
    private String phoneNumber;
    private Membership membership;
}
