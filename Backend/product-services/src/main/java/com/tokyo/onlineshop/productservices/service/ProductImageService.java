package com.tokyo.onlineshop.productservices.service;

import com.tokyo.onlineshop.productservices.entity.Product;
import com.tokyo.onlineshop.productservices.entity.ProductImage;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductImageService {

    List<ProductImage> saveImages(Product product, List<MultipartFile> files, List<String> altTexts);

}
