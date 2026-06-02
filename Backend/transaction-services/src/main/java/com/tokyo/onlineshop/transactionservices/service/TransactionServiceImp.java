package com.tokyo.onlineshop.transactionservices.service;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.common.dto.PagingResponse;
import com.tokyo.onlineshop.transactionservices.client.CartClient;
import com.tokyo.onlineshop.transactionservices.dto.AddTransactionAddressResponseDto;
import com.tokyo.onlineshop.transactionservices.dto.AddTransactionDetailResponseDto;
import com.tokyo.onlineshop.transactionservices.dto.AddTransactionResponseDto;
import com.tokyo.onlineshop.transactionservices.dto.GetTransactionDetailResponseDto;
import com.tokyo.onlineshop.transactionservices.dto.TransactionAddressResponseDto;
import com.tokyo.onlineshop.transactionservices.dto.GetTransactionListDto;
import com.tokyo.onlineshop.transactionservices.entity.Transaction;
import com.tokyo.onlineshop.transactionservices.entity.TransactionAddress;
import com.tokyo.onlineshop.transactionservices.enums.TransactionStatus;
import com.tokyo.onlineshop.transactionservices.repository.TransactionRepository;
import com.tokyo.onlineshop.transactionservices.specification.TransactionSpecification;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.cglib.core.Local;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

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
    private final CartClient client;

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
                .orderId(savedTransaction.getOrderId())
                .GrandTotal(savedTransaction.getGrandTotal())
                .userAddress(address)
                .transactionDetail(transactionDetailList)
                .build();

        client.deleteUserCart(getAuthorizationHeader());

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

    private String getAuthorizationHeader() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            throw new RuntimeException("Authorization header is not available");
        }

        String authorizationHeader = attributes.getRequest().getHeader(HttpHeaders.AUTHORIZATION);
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            throw new RuntimeException("Authorization header is required");
        }

        return authorizationHeader;
    }

    @Transactional
    @Override
    public BaseResponse getTransactionDetail(UUID transactionId) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        Transaction transaction = repository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getUserId().equals(UUID.fromString(userId))) {
            return BaseResponse.builder()
                    .status(HttpStatus.FORBIDDEN.value())
                    .code(HttpStatus.FORBIDDEN)
                    .message("You are not authorized to view this transaction")
                    .data(null)
                    .build();
        }

        TransactionAddress address = transaction.getDeliveryAddress();
        TransactionAddressResponseDto addressDto = null;
        if (address != null) {
            addressDto = TransactionAddressResponseDto.builder()
                    .recipientName(address.getRecipientName())
                    .recipientPhone(address.getRecipientPhone())
                    .addressLine(address.getAddressLine())
                    .city(address.getCity())
                    .province(address.getProvince())
                    .postalCode(address.getPostalCode())
                    .addressLabel(address.getAddressLabel())
                    .deliveryNotes(address.getDeliveryNotes())
                    .build();
        }

        List<AddTransactionDetailResponseDto> items = transaction.getTransactionDetailList().stream()
                .map(detail -> AddTransactionDetailResponseDto.builder()
                        .productName(detail.getProductName())
                        .quantity(detail.getQuantity())
                        .productUnit(detail.getProductUnit())
                        .price(detail.getPrice())
                        .subTotal(detail.getSubtotal())
                        .build()
                ).toList();

        GetTransactionDetailResponseDto data = GetTransactionDetailResponseDto.builder()
                .transactionId(transaction.getId())
                .orderId(transaction.getOrderId())
                .status(transaction.getStatus())
                .grandTotal(transaction.getGrandTotal())
                .address(addressDto)
                .items(items)
                .build();

        return BaseResponse.builder()
                .status(HttpStatus.OK.value())
                .code(HttpStatus.OK)
                .data(data)
                .message("Transaction detail retrieved successfully")
                .build();
    }

    @Override
    public BaseResponse getTransactionList(int currentPage, int pageSize, String startDate, String endDate) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        if(userId == null){
            return BaseResponse.builder()
                    .status(HttpStatus.OK.value())
                    .code(HttpStatus.OK)
                    .message("Please Login first to see the transaction")
                    .data(null)
                    .build();
        }

        Sort sort = Sort.by(Sort.Direction.DESC,"createdAt");
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Specification<Transaction> spec = (root, query, cb) -> cb.conjunction();
        spec = spec.and(TransactionSpecification.hasUserId(UUID.fromString(userId)));


        if(startDate != null || endDate != null){
            spec = spec.and(TransactionSpecification.hasDate(LocalDate.parse(startDate,formatter), LocalDate.parse(endDate,formatter)));
        }


        Page<Transaction> transactionList = repository.findAll(spec,PageRequest.of(currentPage - 1,pageSize,sort));
        List<GetTransactionListDto> dtoList = transactionList.getContent().stream()
                .map(t -> GetTransactionListDto.builder()
                        .transactionId(t.getId())
                        .orderId(t.getOrderId())
                        .status(t.getStatus())
                        .grandTotal(t.getGrandTotal())
                        .build()
                ).toList();

        PagingResponse response = PagingResponse.builder()
                .items(dtoList)
                .currentPage(currentPage)
                .pageSize(pageSize)
                .totalPages(transactionList.getTotalPages())
                .totalItems(transactionList.getTotalElements())
                .build();

        return BaseResponse.builder()
                .status(HttpStatus.OK.value())
                .code(HttpStatus.OK)
                .data(response)
                .message("data retrieved successfully")
                .build();
    }


}
