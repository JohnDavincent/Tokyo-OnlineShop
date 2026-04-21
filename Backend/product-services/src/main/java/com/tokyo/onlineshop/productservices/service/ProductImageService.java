package com.tokyo.onlineshop.productservices.service;

import com.tokyo.onlineshop.productservices.dto.CreateImageRequest;
import com.tokyo.onlineshop.productservices.dto.CreateImageResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface ProductImageService {

    List<CreateImageResponse> uploadImage(String slug, List<MultipartFile> files, List<String> altTexts);

    List<CreateImageResponse> addImage(UUID productId, List<CreateImageRequest> request);

}
