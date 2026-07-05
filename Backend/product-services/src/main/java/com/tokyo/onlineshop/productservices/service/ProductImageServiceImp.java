package com.tokyo.onlineshop.productservices.service;

import com.tokyo.common.exception.BadRequestException;
import com.tokyo.onlineshop.productservices.entity.Product;
import com.tokyo.onlineshop.productservices.entity.ProductImage;
import com.tokyo.onlineshop.productservices.helper.ImageFileHelper;
import com.tokyo.onlineshop.productservices.repository.ProductImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ProductImageServiceImp implements ProductImageService {

    @Value("${app.upload.dir-pc}")
    private String uploadDir;

    private final ProductImageRepository productImageRepository;
    private final ImageFileHelper fileHelper;

    @Override
    public List<ProductImage> saveImages(Product product, List<MultipartFile> files, List<String> altTexts) {
        if (files == null || files.isEmpty()) {
            return List.of();
        }

        String slug = product.getName().strip().toLowerCase(Locale.ROOT).replaceAll("\\s+", "-");
        List<ProductImage> saved = new ArrayList<>();

        try {
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);

            for (int i = 0; i < files.size(); i++) {
                MultipartFile file = files.get(i);
                if (file == null || file.isEmpty()) {
                    throw new BadRequestException("Image file at index " + i + " is empty");
                }

                String altText = (altTexts != null && i < altTexts.size()) ? altTexts.get(i) : null;
                String fileName = fileHelper.createImageFileName(slug, file);
                String url = "/images/products/" + fileName;
                Path target = uploadPath.resolve(fileName);

                file.transferTo(target.toFile());

                ProductImage image = ProductImage.builder()
                        .product(product)
                        .slug(slug)
                        .url(url)
                        .altText(altText)
                        .isPrimary(i == 0)
                        .build();

                saved.add(productImageRepository.save(image));
            }
        } catch (IOException e) {
            throw new BadRequestException("Failed to save image file");
        }

        return saved;
    }
}
