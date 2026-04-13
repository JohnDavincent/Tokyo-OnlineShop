package com.tokyo.onlineshop.productservices.service;

import com.tokyo.onlineshop.productservices.dto.CreateCategoryRequest;
import com.tokyo.onlineshop.productservices.dto.CreateCategoryResponse;

public interface CategoryService {

    public CreateCategoryResponse CreateCategory(CreateCategoryRequest request);
}
