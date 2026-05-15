package com.tokyo.onlineshop.transactionservices.controller;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.onlineshop.transactionservices.dto.AddTransactionRequest;
import com.tokyo.onlineshop.transactionservices.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/tokyo/gropup/transaction")
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping()
    ResponseEntity<BaseResponse> createTransaction(@RequestBody AddTransactionRequest request){
        BaseResponse response = transactionService.createTransaction(request.getAddressId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
