package com.tokyo.onlineshop.productservices.service;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.onlineshop.productservices.dto.CreateImageRequest;
import com.tokyo.onlineshop.productservices.dto.CreateImageResponse;
import com.tokyo.onlineshop.productservices.entity.Product;
import com.tokyo.onlineshop.productservices.entity.ProductImage;
import com.tokyo.onlineshop.productservices.helper.ImageFileHelper;
import com.tokyo.onlineshop.productservices.repository.ProductImageRepository;
import com.tokyo.onlineshop.productservices.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductImageServiceImp implements ProductImageService {

    @Value("${app.upload.dir-pc}")
    private String uploadDir;

    private final ProductImageRepository productImageRepository;
    private final ProductRepository productRepository;
    private final ImageFileHelper fileHelper;

    @Override
    public BaseResponse uploadImage(String slug, List<MultipartFile> files, List<String> altTexts) {
        if (files == null || files.isEmpty()) {
            throw new RuntimeException("Image is empty");
        }

        String safeSlug = slug == null || slug.isBlank()
                ? "product-image"
                : slug.strip().toLowerCase(Locale.ROOT).replaceAll("\\s+", "-");

        List<CreateImageResponse> imageList = new ArrayList<>();

        try {
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);

            for (int i = 0; i < files.size(); i++) {
                MultipartFile file = files.get(i);
                if (file == null || file.isEmpty()) {
                    throw new RuntimeException("Image file is empty");
                }

                String altText = null;
                if (altTexts != null && i < altTexts.size()) {
                    altText = altTexts.get(i);
                }

                String fileName = fileHelper.createImageFileName(safeSlug, file);
                String url = "/images/products/" + fileName;
                Path target = uploadPath.resolve(fileName);

                file.transferTo(target.toFile());

                imageList.add(CreateImageResponse.builder()
                        .url(url)
                        .altText(altText)
                        .slug(safeSlug)
                        .isPrimary(i == 0)
                        .build());
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to save the image", e);
        }

        return BaseResponse.builder()
                .status(HttpStatus.CREATED.value())
                .code(HttpStatus.CREATED)
                .message("Images uploaded successfully")
                .data(imageList)
                .build();
    }

    @Override
    public BaseResponse addImage(UUID productId, List<CreateImageRequest> request) {
        if (request == null || request.isEmpty()) {
            return BaseResponse.builder()
                    .status(HttpStatus.CREATED.value())
                    .code(HttpStatus.CREATED)
                    .message("No images to add")
                    .data(List.of())
                    .build();
        }

        Product existProduct = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("No product found"));

        String slug = existProduct.getName().strip().toLowerCase(Locale.ROOT).replaceAll("\\s+", "-");
        List<CreateImageResponse> imageList = new ArrayList<>();

        for (int i = 0; i < request.size(); i++) {
            CreateImageRequest image = request.get(i);
            if (image.getUrl() == null || image.getUrl().isBlank()) {
                throw new RuntimeException("Image url is empty");
            }

            ProductImage addImage = ProductImage.builder()
                    .product(existProduct)
                    .slug(slug)
                    .url(image.getUrl())
                    .altText(image.getAltText())
                    .isPrimary(i == 0)
                    .build();

            productImageRepository.save(addImage);

            imageList.add(CreateImageResponse.builder()
                    .productName(existProduct.getName())
                    .isPrimary(addImage.getIsPrimary())
                    .url(addImage.getUrl())
                    .altText(addImage.getAltText())
                    .slug(addImage.getSlug())
                    .build());
        }

        return BaseResponse.builder()
                .status(HttpStatus.CREATED.value())
                .code(HttpStatus.CREATED)
                .message("Images added successfully")
                .data(imageList)
                .build();
    }
}
