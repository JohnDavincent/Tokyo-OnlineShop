package com.tokyo.onlineshop.userservices.dto;

import com.tokyo.onlineshop.userservices.Membership;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class UserDataResponse {
    private String username;
    private String phoneNumber;
    private Membership membership;
    private String password;
    private List<String> address;
}
