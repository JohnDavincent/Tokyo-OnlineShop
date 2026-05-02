package com.tokyo.onlineshop.productservices.service;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.onlineshop.productservices.dto.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface CategoryService {

    BaseResponse CreateCategory(CreateCategoryRequest request);
    BaseResponse createImage(UUID categoryId, MultipartFile file);
    BaseResponse getCategoryList();
    BaseResponse getSubCategoryList(UUID parentId);

}
