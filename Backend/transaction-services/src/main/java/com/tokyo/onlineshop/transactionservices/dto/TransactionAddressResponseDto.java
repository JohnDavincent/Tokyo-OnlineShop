package com.tokyo.onlineshop.transactionservices.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TransactionAddressResponseDto {
    private String recipientName;
    private String recipientPhone;
    private String addressLine;
    private String city;
    private String province;
    private String postalCode;
    private String addressLabel;
    private String deliveryNotes;
}
