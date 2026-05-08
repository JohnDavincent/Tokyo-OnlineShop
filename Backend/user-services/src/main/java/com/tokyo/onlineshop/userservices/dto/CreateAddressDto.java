package com.tokyo.onlineshop.userservices.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreateAddressDto {
    private String fullAddress;
    private String Province;
    private String notes;
    private String recipientName;
    private String recipientPhone;
    private String city;
    private String postalCode;
}
