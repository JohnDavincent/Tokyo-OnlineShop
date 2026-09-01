package com.tokyo.onlineshop.paymentservices.controller;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.onlineshop.paymentservices.dto.ConfirmPaymentRequest;
import com.tokyo.onlineshop.paymentservices.dto.SelectPaymentMethodRequest;
import com.tokyo.onlineshop.paymentservices.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/tokyo/gropup/payment")
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/channels")
    public ResponseEntity<BaseResponse> getChannels() {
        BaseResponse response = paymentService.getChannels();
        return new ResponseEntity<>(response, response.code());
    }

    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<BaseResponse> getPaymentByTransaction(@PathVariable UUID transactionId) {
        BaseResponse response = paymentService.getPaymentByTransaction(transactionId);
        return new ResponseEntity<>(response, response.code());
    }

    @PostMapping("/{paymentId}/method")
    public ResponseEntity<BaseResponse> selectMethod(
            @PathVariable UUID paymentId,
            @Valid @RequestBody SelectPaymentMethodRequest request
    ) {
        BaseResponse response = paymentService.selectMethod(paymentId, request.getChannelCode());
        return new ResponseEntity<>(response, response.code());
    }

    @PostMapping("/{paymentId}/confirm")
    public ResponseEntity<BaseResponse> confirmPayment(
            @PathVariable UUID paymentId,
            @Valid @RequestBody(required = false) ConfirmPaymentRequest request
    ) {
        BaseResponse response = paymentService.confirmPayment(paymentId, request);
        return new ResponseEntity<>(response, response.code());
    }
}
