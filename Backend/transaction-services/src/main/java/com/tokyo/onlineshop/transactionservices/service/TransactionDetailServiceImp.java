package com.tokyo.onlineshop.transactionservices.service;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.common.exception.BadRequestException;
import com.tokyo.common.exception.NotFoundException;
import com.tokyo.onlineshop.transactionservices.client.CartClient;
import com.tokyo.onlineshop.transactionservices.client.UserClient;
import com.tokyo.onlineshop.transactionservices.dto.AddTransactionDetailResponseDto;
import com.tokyo.onlineshop.transactionservices.dto.AddTransactionResponseDto;
import com.tokyo.onlineshop.transactionservices.dto.CartDetailDto;
import com.tokyo.onlineshop.transactionservices.dto.GetUserAddressDto;
import com.tokyo.onlineshop.transactionservices.entity.Transaction;
import com.tokyo.onlineshop.transactionservices.entity.TransactionAddress;
import com.tokyo.onlineshop.transactionservices.entity.TransactionDetail;
import com.tokyo.onlineshop.transactionservices.repository.TransactionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Slf4j
@Service
public class TransactionDetailServiceImp implements TransactionDetailService{

    private final CartClient client;
    private final TransactionRepository transactionRepository;
    private final UserClient userClient;

    @Transactional
    @Override
    public List<AddTransactionDetailResponseDto> addTransactionDetail(UUID transactionId) {
        try{
            Transaction transaction = transactionRepository.findById(transactionId).orElseThrow(() -> new NotFoundException("No transaction with id " + transactionId + " is found"));
            List<CartDetailDto> cartDetail = client.getCartDetail(getAuthorizationHeader());
            List<TransactionDetail> transactionDetailList = cartDetail.stream()
                    .map(detail -> TransactionDetail.builder()
                                .productName(detail.getProductName())
                                .productId(detail.getProductId())
                                .productUnitId(detail.getProductUnitId())
                                .quantity(detail.getQuantity())
                                .productUnit(detail.getProductUnit())
                                .price(detail.getPrice())
                                .subtotal(detail.getSubTotal())
                                .transaction(transaction)
                                .build())
                    .collect(Collectors.toList());

            transaction.setTransactionDetailList(transactionDetailList);
            transaction.setGrandTotal(
                   transactionDetailList.stream()
                           .map(TransactionDetail::getSubtotal)
                           .reduce(BigDecimal.ZERO,BigDecimal::add)
            );

            transactionRepository.save(transaction);

            return transactionDetailList.stream()
                    .map(detail -> AddTransactionDetailResponseDto.builder()
                            .productName(detail.getProductName())
                            .quantity(detail.getQuantity())
                            .productUnit(detail.getProductUnit())
                            .price(detail.getPrice())
                            .subTotal(detail.getSubtotal())
                            .build()
                    ).toList();

        }catch (BadRequestException | NotFoundException e){
            throw e;
        }catch (Exception e){
            log.error("[CartClient] error to fetch cart list data");
            throw new BadRequestException("Failed to create transaction detail");
        }
    }

    private String getAuthorizationHeader() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            throw new BadRequestException("Authorization header is not available");
        }

        String authorizationHeader = attributes.getRequest().getHeader(HttpHeaders.AUTHORIZATION);
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            throw new BadRequestException("Authorization header is required");
        }

        return authorizationHeader;
    }


}
