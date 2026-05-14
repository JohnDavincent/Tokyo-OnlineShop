package com.tokyo.onlineshop.transactionservices.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "cartClient", url = "http://localhost:5002/tokyo/gropup/cart")
public interface CartClient {


}
