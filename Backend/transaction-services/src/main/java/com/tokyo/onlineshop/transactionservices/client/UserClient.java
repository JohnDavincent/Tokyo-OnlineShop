package com.tokyo.onlineshop.transactionservices.client;

import com.tokyo.onlineshop.transactionservices.dto.GetUserAddressDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;

@FeignClient(name = "userClient", url = "http://localhost:5000/tokyogo/user")
public interface UserClient {

        @GetMapping("/address/list")
        public List<GetUserAddressDto> userAddressList(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader);

}
