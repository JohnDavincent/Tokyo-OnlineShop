package com.tokyo.onlineshop.paymentservices.controller;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.onlineshop.paymentservices.dto.RejectPaymentRequest;
import com.tokyo.onlineshop.paymentservices.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * The admin payment inbox: everything a customer has claimed to pay lands here
 * and waits for an approve or reject decision.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/tokyo/gropup/ad-min/payment")
public class AdminPaymentController {

    private final PaymentService paymentService;

    @GetMapping("/inbox")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse> getInbox(
            @RequestParam(name = "currentPage", defaultValue = "1") int currentPage,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "keyword", required = false) String keyword
    ) {
        BaseResponse response = paymentService.getAdminPaymentList(currentPage, pageSize, status, keyword);
        return new ResponseEntity<>(response, response.code());
    }

    @GetMapping("/inbox/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse> getInboxCount() {
        BaseResponse response = paymentService.getInboxCount();
        return new ResponseEntity<>(response, response.code());
    }

    @GetMapping("/{paymentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse> getPaymentDetail(@PathVariable UUID paymentId) {
        BaseResponse response = paymentService.getAdminPaymentDetail(paymentId);
        return new ResponseEntity<>(response, response.code());
    }

    @GetMapping("/transaction/{transactionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse> getPaymentByTransaction(@PathVariable UUID transactionId) {
        BaseResponse response = paymentService.getAdminPaymentByTransaction(transactionId);
        return new ResponseEntity<>(response, response.code());
    }

    @PostMapping("/{paymentId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse> approve(@PathVariable UUID paymentId) {
        BaseResponse response = paymentService.approvePayment(paymentId);
        return new ResponseEntity<>(response, response.code());
    }

    @PostMapping("/{paymentId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse> reject(
            @PathVariable UUID paymentId,
            @Valid @RequestBody(required = false) RejectPaymentRequest request
    ) {
        BaseResponse response = paymentService.rejectPayment(paymentId, request);
        return new ResponseEntity<>(response, response.code());
    }
}
