package com.tokyo.onlineshop.productservices.controller;

import com.tokyo.onlineshop.dto.WebResponse;
import com.tokyo.onlineshop.productservices.dto.CreateCategoryRequest;
import com.tokyo.onlineshop.productservices.dto.CreateCategoryResponse;
import com.tokyo.onlineshop.productservices.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/tokyo/gropup/ad-min")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

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
}
