package com.tokyo.onlineshop.productservices.service;

import com.tokyo.onlineshop.productservices.dto.CategoryListResponse;
import com.tokyo.onlineshop.productservices.dto.CreateCategoryImageResponse;
import com.tokyo.onlineshop.productservices.dto.CreateCategoryRequest;
import com.tokyo.onlineshop.productservices.dto.CreateCategoryResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface CategoryService {

    public CreateCategoryResponse CreateCategory(CreateCategoryRequest request);
    public CreateCategoryImageResponse createImage(UUID categoryId, MultipartFile file);
    public List<CategoryListResponse> getCategoryList();

}
