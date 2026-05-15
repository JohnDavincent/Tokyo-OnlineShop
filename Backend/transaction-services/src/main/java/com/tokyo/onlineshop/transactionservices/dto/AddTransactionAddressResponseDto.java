package com.tokyo.onlineshop.transactionservices.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AddTransactionAddressResponseDto {
    private UUID addressId;
    private String recipientName;
    private String recipientPhoneNumber;
    private String notes;
    private String address;
    private String province;
    private String city;
    private String label;
    private String postalCode;
    private boolean isDefaultShipping;
}
