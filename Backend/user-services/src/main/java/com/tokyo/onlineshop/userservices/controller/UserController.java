package com.tokyo.onlineshop.userservices.controller;

import com.tokyo.onlineshop.userservices.dto.CreateAddressDto;
import com.tokyo.onlineshop.userservices.dto.CreateAddressRequest;
import com.tokyo.onlineshop.userservices.dto.UserDataResponse;
import com.tokyo.onlineshop.userservices.service.AddressService;
import com.tokyo.onlineshop.userservices.service.UserEntityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("tokyogo/user")
@RequiredArgsConstructor
public class UserController {

    private final UserEntityService userEntityService;
    private final AddressService addressService;

    @GetMapping("/profile")
    ResponseEntity<UserDataResponse> GetUserProfile(){
        UserDataResponse response =  userEntityService.getUserProfile();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/address")
    ResponseEntity<CreateAddressDto> addAddress(@RequestBody CreateAddressRequest request){
        CreateAddressDto response = addressService.addAddress(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

}
