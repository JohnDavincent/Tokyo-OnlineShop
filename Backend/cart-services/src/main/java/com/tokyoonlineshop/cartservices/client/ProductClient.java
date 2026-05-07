package com.tokyoonlineshop.cartservices.client;

import com.tokyoonlineshop.cartservices.dto.GetProductClientResponse;
import com.tokyoonlineshop.cartservices.dto.GetProductUnitResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.UUID;

@FeignClient(url = "http://localhost:5001/tokyo/gropup/product", name = "product-services")
public interface ProductClient {

    @GetMapping("/{id}")
    public GetProductClientResponse getProduct(@PathVariable("id") UUID productId);

    @PostMapping("/list-by-ids")
    public List<GetProductClientResponse> getProductListByIds(@RequestBody List<UUID> productIds);

    @PostMapping("/unit/{productId}")
    public List<GetProductUnitResponse> getUnit(@RequestBody List<UUID> unitId, @PathVariable("productId") UUID productId);
}
