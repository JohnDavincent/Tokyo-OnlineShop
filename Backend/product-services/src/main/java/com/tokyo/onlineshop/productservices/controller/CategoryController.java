package com.tokyo.onlineshop.productservices.controller;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.onlineshop.productservices.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/tokyo/gropup/category")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/list-category")
    ResponseEntity<BaseResponse> getCategoryList(){
        BaseResponse response = categoryService.getCategoryList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/list-subcategory/{parentId}")
    ResponseEntity<BaseResponse> getSubCategoryList(@PathVariable("parentId") UUID parentId){
        BaseResponse response = categoryService.getSubCategoryList(parentId);
        return ResponseEntity.ok(response);
    }



}
