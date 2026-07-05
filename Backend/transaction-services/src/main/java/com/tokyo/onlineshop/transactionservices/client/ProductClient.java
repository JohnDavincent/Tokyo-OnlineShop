package com.tokyo.onlineshop.transactionservices.client;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.onlineshop.transactionservices.dto.IncrementSoldRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "productClient", url = "http://localhost:5001/tokyo/gropup/product")
public interface ProductClient {

    @PostMapping("/increment-sold")
    BaseResponse incrementTotalSold(@RequestBody List<IncrementSoldRequest> request);
}
