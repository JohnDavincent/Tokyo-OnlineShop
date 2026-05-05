package com.tokyoonlineshop.cartservices.client;

import com.tokyoonlineshop.cartservices.dto.GetProductClientResponse;
import com.tokyoonlineshop.cartservices.dto.GetProductUnitResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.UUID;

@FeignClient(url = "http://localhost:50001/tokyo/gropup/product", name = "product-services")
public interface ProductClient {

    @GetMapping("/{id}")
    public GetProductClientResponse getProduct(@PathVariable("id") UUID productId);

    @GetMapping("/unit/{productId}")
    public List<GetProductUnitResponse> getUnit(List<UUID> unitId, UUID productId);
}
