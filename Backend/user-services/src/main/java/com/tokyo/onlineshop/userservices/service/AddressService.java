package com.tokyo.onlineshop.userservices.service;

import com.tokyo.onlineshop.userservices.dto.CreateAddressDto;
import com.tokyo.onlineshop.userservices.dto.CreateAddressRequest;
import com.tokyo.onlineshop.userservices.dto.GetUserAddressDto;

import java.util.List;

public interface AddressService {
    public CreateAddressDto addAddress(CreateAddressRequest request);
    public List<GetUserAddressDto> getUserAddressList();
}
