package com.tokyo.onlineshop.productservices.service;

import com.tokyo.onlineshop.productservices.dto.CategoryListResponse;
import com.tokyo.onlineshop.productservices.dto.CreateCategoryRequest;
import com.tokyo.onlineshop.productservices.dto.CreateCategoryResponse;
import org.springframework.web.multipart.MultipartFile;

public interface CategoryService {

    public CreateCategoryResponse CreateCategory(CreateCategoryRequest request, MultipartFile file);
    public CategoryListResponse getCategoryList();
}
