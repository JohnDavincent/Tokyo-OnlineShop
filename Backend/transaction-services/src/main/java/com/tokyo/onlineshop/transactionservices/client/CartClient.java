package com.tokyo.onlineshop.transactionservices.client;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.onlineshop.transactionservices.dto.CartDetailDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;

@FeignClient(name = "cartClient", url = "http://localhost:5002/tokyo/gropup/cart")
public interface CartClient {

    @GetMapping("/cartDetail")
    List<CartDetailDto> getCartDetail(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader);

    @DeleteMapping()
    BaseResponse deleteUserCart(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader);
}
