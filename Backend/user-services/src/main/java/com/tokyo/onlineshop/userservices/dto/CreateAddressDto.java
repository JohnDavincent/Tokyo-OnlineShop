package com.tokyo.onlineshop.userservices.dto;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateAddressDto {
    private String fullAddress;
    private String Province;
    private String notes;
    private String recipientName;
    private String recipientPhone;
    private String city;
    private String postalCode;
}
