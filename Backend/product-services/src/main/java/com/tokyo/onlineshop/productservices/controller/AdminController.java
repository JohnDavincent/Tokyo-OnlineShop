package com.tokyo.onlineshop.productservices.controller;


import com.tokyo.common.dto.BaseResponse;
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
    ResponseEntity<BaseResponse> createCategory(@RequestBody CreateCategoryRequest request){
        BaseResponse response = categoryService.CreateCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/brand")
    ResponseEntity<BaseResponse> createBrand(@RequestBody CreateBrandRequest request){
        BaseResponse response = brandService.createBrand(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/product")
    ResponseEntity<BaseResponse> createProduct(@Valid @RequestBody CreateProductRequest req){
        BaseResponse response = productService.createProduct(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping(
            value = "/category/add-image/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    ResponseEntity<BaseResponse> addImage(
            @PathVariable UUID id,
            @RequestPart("images") MultipartFile file){
        BaseResponse response = categoryService.createImage(id,file);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


    @PostMapping(value = "/ad-min/product/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ResponseEntity<BaseResponse> uploadProductImage(
            @RequestParam("slug") String slug,
            @RequestPart("images") List<MultipartFile> images,
            @RequestParam(value = "altText", required = false) List<String> altText
    ) {
        BaseResponse response = productImageService.uploadImage(slug, images, altText);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }



}
