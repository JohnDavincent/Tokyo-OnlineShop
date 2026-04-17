package com.tokyo.onlineshop.productservices.controller;

import com.tokyo.common.dto.WebResponse;
import com.tokyo.onlineshop.productservices.dto.CreateProductRequest;
import com.tokyo.onlineshop.productservices.dto.CreateProductResponse;
import com.tokyo.onlineshop.productservices.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tokyo/gropup/ad-min")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping("/product")
    ResponseEntity<WebResponse<CreateProductResponse>> createProduct(@Valid @RequestBody CreateProductRequest req){
        CreateProductResponse data = productService.createProduct(req);
        WebResponse<CreateProductResponse> response = WebResponse.<CreateProductResponse>builder()
                .value(HttpStatus.CREATED.value())
                .success(true)
                .message("Successfully Created Product")
                .data(data)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

}
