package com.tokyo.onlineshop.transactionservices.controller;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.onlineshop.transactionservices.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/tokyo/gropup/ad-min/transaction")
public class AdminTransactionController {

    private final TransactionService transactionService;

    @GetMapping("list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse> getTransactionList(
            @RequestParam(name = "currentPage", defaultValue = "1") int currentPage,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(name = "startDate", required = false) String startDate,
            @RequestParam(name = "endDate", required = false) String endDate,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "keyword", required = false) String keyword
    ){
        BaseResponse response = transactionService.getAdminTransactionList(currentPage, pageSize, startDate, endDate, status, keyword);
        return new ResponseEntity<>(response, response.code());
    }

    @GetMapping("/{transactionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse> getTransactionDetail(@PathVariable UUID transactionId) {
        BaseResponse response = transactionService.getAdminTransactionDetail(transactionId);
        return new ResponseEntity<>(response, response.code());
    }
}
