package com.tokyo.onlineshop.transactionservices.service;


import com.tokyo.common.exception.BadRequestException;
import com.tokyo.common.exception.NotFoundException;
import com.tokyo.onlineshop.transactionservices.client.UserClient;
import com.tokyo.onlineshop.transactionservices.dto.AddTransactionAddressResponseDto;
import com.tokyo.onlineshop.transactionservices.dto.GetUserAddressDto;
import com.tokyo.onlineshop.transactionservices.entity.Transaction;
import com.tokyo.onlineshop.transactionservices.entity.TransactionAddress;
import com.tokyo.onlineshop.transactionservices.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionAddressServiceImp implements TransactionAddressService{


    private final UserClient userClient;
    private final TransactionRepository transactionRepository;

    @Override
    public AddTransactionAddressResponseDto getUserAddress(UUID transactionId, UUID addressId) {
        List<GetUserAddressDto> listUserAddress = userClient.userAddressList(getAuthorizationHeader());
        log.info("Fetched {} user addresses from user-service for transaction {}", listUserAddress == null ? 0 : listUserAddress.size(), transactionId);
        if(listUserAddress == null || listUserAddress.isEmpty()){
            throw new NotFoundException("user Address not found");
        }
        Optional<TransactionAddress> selectedAddress;

        if(addressId == null){
            selectedAddress  = listUserAddress.stream()
                    .filter(address -> Objects.equals(address.getIsDefaultShipping(), true))
                    .map(transactionAddress -> TransactionAddress.builder()
                            .recipientName(transactionAddress.getRecipientName())
                            .recipientPhone(transactionAddress.getRecipientPhoneNumber())
                            .addressLine(transactionAddress.getAddress())
                            .city(transactionAddress.getCity())
                            .addressLabel(transactionAddress.getLabel())
                            .deliveryNotes(transactionAddress.getNotes())
                            .province(transactionAddress.getProvince())
                            .isDefaultAddress(Objects.equals(transactionAddress.getIsDefaultShipping(), true))
                            .build()
                    ).findFirst();
        } else {

            selectedAddress = listUserAddress.stream()
                    .filter(defaultAddress -> defaultAddress.getAddressId().equals(addressId))
                    .map(transactionAddress -> TransactionAddress.builder()
                            .recipientName(transactionAddress.getRecipientName())
                            .recipientPhone(transactionAddress.getRecipientPhoneNumber())
                            .addressLine(transactionAddress.getAddress())
                            .city(transactionAddress.getCity())
                            .addressLabel(transactionAddress.getLabel())
                            .postalCode(transactionAddress.getPostalCode())
                            .deliveryNotes(transactionAddress.getNotes())
                            .province(transactionAddress.getProvince())
                            .isDefaultAddress(Objects.equals(transactionAddress.getIsDefaultShipping(), true))
                            .build()
                    ).findFirst();
        }

        if(selectedAddress.isEmpty()){
            throw new NotFoundException("Address is not found");
        }

        Transaction transaction = transactionRepository.findById(transactionId).orElseThrow(() -> new NotFoundException("No transaction found for id " + transactionId));
        TransactionAddress userAddress = selectedAddress.get();
        transaction.setDeliveryAddress(userAddress);
        transactionRepository.save(transaction);


        return AddTransactionAddressResponseDto.builder()
                .recipientName(userAddress.getRecipientName())
                .recipientPhoneNumber(userAddress.getRecipientPhone())
                .label(userAddress.getAddressLabel())
                .notes(userAddress.getDeliveryNotes())
                .address(userAddress.getAddressLine())
                .postalCode(userAddress.getPostalCode())
                .city(userAddress.getCity())
                .province(userAddress.getProvince())
                .build();

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
