package com.tokyo.onlineshop.productservices.controller;

import com.tokyo.common.dto.WebResponse;
import com.tokyo.onlineshop.productservices.dto.CreateImageResponse;
import com.tokyo.onlineshop.productservices.dto.CreateProductRequest;
import com.tokyo.onlineshop.productservices.dto.CreateProductResponse;
import com.tokyo.onlineshop.productservices.dto.ProductCard;
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

@RestController
@RequestMapping("/tokyo/gropup/ad-min")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ProductImageService productImageService;

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

    @PostMapping(value = "/product/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ResponseEntity<WebResponse<List<CreateImageResponse>>> uploadProductImage(
            @RequestParam("slug") String slug,
            @RequestPart("images") List<MultipartFile> images,
            @RequestParam(value = "altText", required = false) List<String> altText
    ) {
        List<CreateImageResponse> data = productImageService.uploadImage(slug, images, altText);
        WebResponse<List<CreateImageResponse>> response = WebResponse.<List<CreateImageResponse>>builder()
                .value(HttpStatus.CREATED.value())
                .success(true)
                .message("Successfully uploaded image")
                .data(data)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/product")
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

}
