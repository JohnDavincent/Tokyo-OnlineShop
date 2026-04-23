package com.tokyo.onlineshop.productservices.controller;

import com.tokyo.common.dto.WebResponse;
import com.tokyo.onlineshop.productservices.dto.CreateCategoryRequest;
import com.tokyo.onlineshop.productservices.dto.CreateCategoryResponse;
import com.tokyo.onlineshop.productservices.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/tokyo/gropup/ad-min")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping("/category")
    @PreAuthorize("hasRole('ADMIN')")
    ResponseEntity<WebResponse<CreateCategoryResponse>> createCategory(@RequestBody CreateCategoryRequest request, @RequestPart("images")MultipartFile file){
        CreateCategoryResponse data = categoryService.CreateCategory(request,file);
        WebResponse<CreateCategoryResponse> response = WebResponse.<CreateCategoryResponse>builder()
                .value(HttpStatus.CREATED.value())
                .message("success create Category")
                .success(true)
                .data(data)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
