package com.tokyo.onlineshop.userservices.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Builder
@Data
public class GetUserAddressDto {
    private UUID addressId;
    private String recipientName;
    private String recipientPhoneNumber;
    private String notes;
    private String address;
    private String city;
    private String province;
    private String label;
    private String postalCode;
    private boolean isDefaultShipping;
}
