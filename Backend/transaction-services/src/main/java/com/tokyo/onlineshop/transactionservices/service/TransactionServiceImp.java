package com.tokyo.onlineshop.transactionservices.service;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.onlineshop.transactionservices.dto.AddTransactionAddressResponseDto;
import com.tokyo.onlineshop.transactionservices.dto.AddTransactionDetailResponseDto;
import com.tokyo.onlineshop.transactionservices.dto.AddTransactionResponseDto;
import com.tokyo.onlineshop.transactionservices.entity.Transaction;
import com.tokyo.onlineshop.transactionservices.enums.TransactionStatus;
import com.tokyo.onlineshop.transactionservices.repository.TransactionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class TransactionServiceImp implements TransactionService{

    private final TransactionRepository repository;
    private final TransactionDetailService transactionDetailService;
    private final TransactionAddressService transactionAddressService;

    @Transactional
    @Override
    public BaseResponse createTransaction(UUID addressId) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        LocalDate date = LocalDate.now();
        Integer lastNumberDailyOrder = repository.findLastDailyTransaction();
        int nextNumber = lastNumberDailyOrder == null ? 1 : lastNumberDailyOrder + 1;


        Transaction transaction = Transaction.builder()
                .orderId(createOrderId(date,nextNumber))
                .userId(UUID.fromString(userId))
                .dailyTransactionNumber(nextNumber)
                .status(TransactionStatus.PENDING)
                .build();

        repository.save(transaction);

        List<AddTransactionDetailResponseDto> transactionDetailList = transactionDetailService.addTransactionDetail(transaction.getId());
        AddTransactionAddressResponseDto address = transactionAddressService.getUserAddress(transaction.getId(), addressId);
        Transaction savedTransaction = repository.findById(transaction.getId())
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        AddTransactionResponseDto data =  AddTransactionResponseDto.builder()
                .transactionId(savedTransaction.getOrderId())
                .GrandTotal(savedTransaction.getGrandTotal())
                .userAddress(address)
                .transactionDetail(transactionDetailList)
                .build();

        return BaseResponse.builder()
                .code(HttpStatus.CREATED)
                .status(HttpStatus.CREATED.value())
                .message("Transaction Record saved")
                .data(data)
                .build();
    }

    private String createOrderId(LocalDate date, int number){
        String prefix = "TOKGO";
        String dateText = date.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String sequence = String.format("%05d",number);
        return prefix + "-" + dateText + "-" + sequence;
    }
}
