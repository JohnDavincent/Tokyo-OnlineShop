package com.tokyo.onlineshop.userservices.service;

import com.tokyo.onlineshop.userservices.dto.CreateAddressDto;
import com.tokyo.onlineshop.userservices.dto.CreateAddressRequest;
import com.tokyo.onlineshop.userservices.entity.Address;
import com.tokyo.onlineshop.userservices.entity.UserEntity;
import com.tokyo.onlineshop.userservices.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AddressServiceImp implements AddressService{

    private final AddressRepository addressRepository;

    @Override
    public CreateAddressDto addAddress(CreateAddressRequest request) {
        UserEntity user = SecurityContextHolder.getContext().getAuthentication().getName();
        if(user == null){
            throw new RuntimeException("User is not found");
        }

        Address address = Address.builder()
                .recipientName(request.getRecipientName())
                .recipientPhoneNumber(request.getRecipientPhone())
                .address(request.getFullAddress())
                .city(request.getCity())
                .province(request.getProvince())
                .postalCode(request.getPostalCode())
                .notes(request.getNotes())
                .build();

        addressRepository.save(address);
        address.setUser(user);
        user.addAddress(address);

    }
}
