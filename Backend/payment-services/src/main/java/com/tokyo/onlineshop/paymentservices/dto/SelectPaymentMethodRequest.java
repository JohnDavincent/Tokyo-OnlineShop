package com.tokyo.onlineshop.paymentservices.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SelectPaymentMethodRequest {

    @NotBlank(message = "Channel code is required")
    private String channelCode;
}
