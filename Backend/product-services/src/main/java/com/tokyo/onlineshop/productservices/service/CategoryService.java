package com.tokyo.onlineshop.productservices.service;

import com.tokyo.onlineshop.productservices.dto.*;
import com.tokyo.onlineshop.productservices.projection.SubCategoryProjection;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface CategoryService {

    public CreateCategoryResponse CreateCategory(CreateCategoryRequest request);
    public CreateCategoryImageResponse createImage(UUID categoryId, MultipartFile file);
    public List<CategoryListResponse> getCategoryList();
    public List<GetSubCategoryListResponse> getSubCategoryList(UUID parentId);

}
