package com.tokyo.onlineshop.paymentservices.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RejectPaymentRequest {

    @Size(max = 255, message = "Reason is too long")
    private String reason;
}
