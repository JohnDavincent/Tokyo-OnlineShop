package com.tokyo.onlineshop.transactionservices.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetUserAddressDto {
    private UUID addressId;
    private String recipientName;
    private String recipientPhoneNumber;
    private String notes;
    private String address;
    private String province;
    private String city;
    private String label;
    private String postalCode;
    private Boolean isDefaultShipping;
}
