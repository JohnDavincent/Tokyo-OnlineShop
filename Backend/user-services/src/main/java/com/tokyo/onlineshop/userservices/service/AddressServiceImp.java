package com.tokyo.onlineshop.userservices.service;

import com.tokyo.common.exception.NotFoundException;
import com.tokyo.onlineshop.userservices.dto.CreateAddressDto;
import com.tokyo.onlineshop.userservices.dto.CreateAddressRequest;
import com.tokyo.onlineshop.userservices.dto.GetUserAddressDto;
import com.tokyo.onlineshop.userservices.entity.Address;
import com.tokyo.onlineshop.userservices.entity.UserEntity;
import com.tokyo.onlineshop.userservices.repository.AddressRepository;
import com.tokyo.onlineshop.userservices.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AddressServiceImp implements AddressService{

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Override
    public CreateAddressDto addAddress(CreateAddressRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new NotFoundException("User is not found"));

        Address address = Address.builder()
                .recipientName(request.getRecipientName())
                .recipientPhoneNumber(request.getRecipientPhone())
                .address(request.getFullAddress())
                .city(request.getCity())
                .province(request.getProvince())
                .postalCode(request.getPostalCode())
                .notes(request.getNotes())
                .user(user)
                .build();

        addressRepository.save(address);
        user.addAddress(address);

        return CreateAddressDto.builder()
                .recipientName(address.getRecipientName())
                .recipientPhone(address.getRecipientPhoneNumber())
                .fullAddress(address.getAddress())
                .city(address.getCity())
                .Province(address.getProvince())
                .postalCode(address.getPostalCode())
                .notes(address.getNotes())
                .build();
    }

    @Override
    public List<GetUserAddressDto> getUserAddressList() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Address> addressList = addressRepository.listAllUserAddressData(UUID.fromString(userId));
        log.info("Loaded {} addresses for user {}", addressList.size(), userId);
        return addressList.stream()
                .map(address -> GetUserAddressDto.builder()
                        .addressId(address.getId())
                        .recipientName(address.getRecipientName())
                        .recipientPhoneNumber(address.getRecipientPhoneNumber())
                        .address(address.getAddress())
                        .label(address.getLabel())
                        .province(address.getProvince())
                        .city(address.getCity())
                        .postalCode(address.getPostalCode())
                        .notes(address.getNotes())
                        .isDefaultShipping(address.isDefaultShipping())
                        .build()
                ).toList();
    }
}
