package com.tokyo.onlineshop.paymentservices.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ConfirmPaymentRequest {

    /** Optional: name on the sending account, so the admin can match the mutation. */
    @Size(max = 120, message = "Payer name is too long")
    private String payerName;

    @Size(max = 255, message = "Note is too long")
    private String note;
}
