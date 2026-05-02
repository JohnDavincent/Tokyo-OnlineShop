package com.tokyo.onlineshop.productservices.service;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.onlineshop.productservices.dto.CreateImageRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface ProductImageService {

    BaseResponse uploadImage(String slug, List<MultipartFile> files, List<String> altTexts);

    BaseResponse addImage(UUID productId, List<CreateImageRequest> request);

}
