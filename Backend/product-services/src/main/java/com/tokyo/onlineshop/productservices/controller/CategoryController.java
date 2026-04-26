package com.tokyo.onlineshop.productservices.controller;

import com.tokyo.common.dto.WebResponse;
import com.tokyo.onlineshop.productservices.dto.CategoryListResponse;
import com.tokyo.onlineshop.productservices.dto.CreateCategoryImageResponse;
import com.tokyo.onlineshop.productservices.dto.CreateCategoryRequest;
import com.tokyo.onlineshop.productservices.dto.CreateCategoryResponse;
import com.tokyo.onlineshop.productservices.service.CategoryService;
import feign.Response;
import lombok.RequiredArgsConstructor;
import org.apache.http.protocol.HTTP;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/tokyo/gropup/category")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/list")
    ResponseEntity<WebResponse<List<CategoryListResponse>>> getCategoryList(){
        List<CategoryListResponse> data = categoryService.getCategoryList();
        WebResponse<List<CategoryListResponse>> response = WebResponse.<List<CategoryListResponse>>builder()
                .value(HttpStatus.OK.value())
                .success(true)
                .message("Category loaded successfully")
                .data(data)
                .build();
        return ResponseEntity.ok(response);
    }


}
