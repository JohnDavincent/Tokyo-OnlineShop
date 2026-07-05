package com.tokyo.onlineshop.transactionservices.controller;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.onlineshop.transactionservices.dto.AddTransactionRequest;
import com.tokyo.onlineshop.transactionservices.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    @GetMapping("list")
    ResponseEntity<BaseResponse> getTransactionList(
            @RequestParam(name = "currentPage", defaultValue = "1") int currentPage,
            @RequestParam(name = "pageSize",defaultValue = "10") int pageSize,
            @RequestParam(name = "startDate", required = false) String startDate,
            @RequestParam(name = "endDate", required = false) String endDate
    ){
        BaseResponse response = transactionService.getTransactionList(currentPage,pageSize,startDate,endDate);
        return new ResponseEntity<>(response,response.code());
    }

    @GetMapping("/{transactionId}")
    ResponseEntity<BaseResponse> getTransactionDetail(@PathVariable UUID transactionId) {
        BaseResponse response = transactionService.getTransactionDetail(transactionId);
        return new ResponseEntity<>(response, response.code());
    }

    @PostMapping("/{transactionId}/confirm")
    ResponseEntity<BaseResponse> confirmTransaction(@PathVariable UUID transactionId) {
        BaseResponse response = transactionService.confirmTransaction(transactionId);
        return new ResponseEntity<>(response, response.code());
    }
}
