package com.tokyo.onlineshop.productservices.controller;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.onlineshop.productservices.dto.*;
import com.tokyo.onlineshop.productservices.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/tokyo/gropup/category")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/list-category")
    ResponseEntity<BaseResponse<List<CategoryListResponse>>> getCategoryList(){
        List<CategoryListResponse> data = categoryService.getCategoryList();
        BaseResponse<List<CategoryListResponse>> response = BaseResponse.<List<CategoryListResponse>>builder()
                .value(HttpStatus.OK.value())
                .success(true)
                .message("Category loaded successfully")
                .data(data)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/list-subcategory/{parentId}")
    ResponseEntity<BaseResponse<List<GetSubCategoryListResponse>>> getSubCategoryList(@PathVariable("parentId") UUID parentId){

        List<GetSubCategoryListResponse> data = categoryService.getSubCategoryList(parentId);
        BaseResponse<List<GetSubCategoryListResponse>> response = BaseResponse.<List<GetSubCategoryListResponse>>builder()
                .value(HttpStatus.OK.value())
                .success(true)
                .message("Subcategory loaded successfully")
                .data(data)
                .build();
        return ResponseEntity.ok(response);
    }



}
