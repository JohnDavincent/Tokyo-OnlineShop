package com.tokyo.onlineshop.userservices.service;

import com.tokyo.onlineshop.userservices.dto.CreateAddressDto;
import com.tokyo.onlineshop.userservices.dto.CreateAddressRequest;

public interface AddressService {
    public CreateAddressDto addAddress(CreateAddressRequest request);
}
