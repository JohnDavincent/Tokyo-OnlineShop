package com.tokyo.onlineshop.productservices.controller;


import com.tokyo.common.dto.WebResponse;
import com.tokyo.onlineshop.productservices.dto.*;
import com.tokyo.onlineshop.productservices.service.BrandService;
import com.tokyo.onlineshop.productservices.service.CategoryService;
import com.tokyo.onlineshop.productservices.service.ProductImageService;
import com.tokyo.onlineshop.productservices.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/tokyo/gropup/ad-min")
public class AdminController {

    private final CategoryService categoryService;
    private final ProductService productService;
    private final BrandService brandService;
    private final ProductImageService productImageService;

    @PostMapping("/category")
    @PreAuthorize("hasRole('ADMIN')")
    ResponseEntity<WebResponse<CreateCategoryResponse>> createCategory(@RequestBody CreateCategoryRequest request){
        CreateCategoryResponse data = categoryService.CreateCategory(request);
        WebResponse<CreateCategoryResponse> response = WebResponse.<CreateCategoryResponse>builder()
                .value(HttpStatus.CREATED.value())
                .message("success create Category")
                .success(true)
                .data(data)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/brand")
    ResponseEntity<WebResponse<CreateBrandResponse>> createBrand(@RequestBody CreateBrandRequest request){
        CreateBrandResponse data = brandService.createBrand(request);
        WebResponse<CreateBrandResponse> response = WebResponse.<CreateBrandResponse>builder()
                .value(HttpStatus.CREATED.value())
                .success(true)
                .message("Success created Brand")
                .data(data)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

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

    @PostMapping(
            value = "/category/add-image/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    ResponseEntity<WebResponse<CreateCategoryImageResponse>> addImage(
            @PathVariable UUID id,
            @RequestPart("images") MultipartFile file){
        CreateCategoryImageResponse data = categoryService.createImage(id,file);
        WebResponse<CreateCategoryImageResponse> response = WebResponse.<CreateCategoryImageResponse>builder()
                .value(HttpStatus.CREATED.value())
                .message("Add image Successfully")
                .success(true)
                .data(data)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


    @PostMapping(value = "/ad-min/product/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
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



}
