package com.tokyo.onlineshop.paymentservices.dto;

import com.tokyo.onlineshop.paymentservices.enums.PaymentMethod;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentChannelDto {
    private String code;
    private PaymentMethod method;
    private String label;
    private String accountNumber;
    private String accountName;
    private String qrImageUrl;
    private String instruction;
}
