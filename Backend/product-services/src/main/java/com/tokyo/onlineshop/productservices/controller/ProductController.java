package com.tokyo.onlineshop.productservices.controller;

import com.tokyo.common.dto.WebResponse;
import com.tokyo.onlineshop.productservices.dto.*;
import com.tokyo.onlineshop.productservices.service.ProductImageService;
import com.tokyo.onlineshop.productservices.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/tokyo/gropup/product")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;


    @GetMapping()
    ResponseEntity<WebResponse<List<ProductCard>>> getProductHomeList(){
        List<ProductCard> data = productService.getProductList();
        WebResponse<List<ProductCard>> response = WebResponse.<List<ProductCard>>builder()
                .value(HttpStatus.OK.value())
                .success(true)
                .message("Product Success loaded")
                .data(data)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("arrival")
    ResponseEntity<WebResponse<List<ProductCard>>> getProductArrivalList(){
        List<ProductCard> data = productService.getLastArrivalProductList();
        WebResponse<List<ProductCard>> response = WebResponse.<List<ProductCard>>builder()
                .value(HttpStatus.OK.value())
                .success(true)
                .message("Product Success loaded")
                .data(data)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    ResponseEntity<WebResponse<GetProductDetailResponse>> getProductDetail(@PathVariable UUID id){
        GetProductDetailResponse data = productService.getProductDetail(id);
        WebResponse<GetProductDetailResponse> response = WebResponse.<GetProductDetailResponse>builder()
                .success(true)
                .message("Product detail success loaded")
                .value(HttpStatus.OK.value())
                .data(data)
                .build();

        return ResponseEntity.ok(response);
    }

}
