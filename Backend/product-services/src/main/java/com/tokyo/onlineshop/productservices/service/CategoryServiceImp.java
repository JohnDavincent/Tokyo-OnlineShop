package com.tokyo.onlineshop.productservices.service;

import com.tokyo.onlineshop.productservices.ProductionStatus;
import com.tokyo.onlineshop.productservices.dto.CategoryListResponse;
import com.tokyo.onlineshop.productservices.dto.CreateCategoryRequest;
import com.tokyo.onlineshop.productservices.dto.CreateCategoryResponse;
import com.tokyo.onlineshop.productservices.entity.Category;
import com.tokyo.onlineshop.productservices.helper.ImageFileHelper;
import com.tokyo.onlineshop.productservices.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryServiceImp implements CategoryService{

    private final CategoryRepository categoryRepository;
    private final ImageFileHelper helper;

    @Value("${app.upload-dir}")
    private String uploadDir;


    @Override
    public CreateCategoryResponse CreateCategory(CreateCategoryRequest request, MultipartFile file) {
        if(request == null || request.getName() == null || request.getName().isBlank()){
            throw new RuntimeException("Please fill the field!");
        }

        if(categoryRepository.existsByName(request.getName())){
           throw new RuntimeException("Category already register with that name");
        }


        String normalize = request.getName().strip();
        String slug = normalize.toLowerCase(Locale.ROOT).replaceAll("//s+","-");

        try {
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);
            String fileName = helper.createImageFileName(slug,file);
            String url = "/images/category" + fileName;
            Path target = uploadPath.resolve(url);

            file.transferTo(target);

        Category createCategory = Category.builder()
                .name(request.getName())
                .status(ProductionStatus.AVAILABLE)
                .image_url(url)
                .alt_text(request.getAltText())
                .slug(slug)
                .build();

        if(request.getParent_id() != null) {
            if(!categoryRepository.existsById(request.getParent_id())){
                throw new RuntimeException("Parent category not found");
            }
            createCategory.setParentId(request.getParent_id());
        }

        categoryRepository.save(createCategory);

        return CreateCategoryResponse.builder()
                .id(createCategory.getId())
                .status(createCategory.getStatus())
                .ParentCategory(request.getParent_id())
                .slug(createCategory.getSlug())
                .build();

        }catch (IOException e) {
            throw new RuntimeException("Failed to save the image", e);
        }

    }

    @Override
    public CategoryListResponse getCategoryList() {
        Map<UUID,String> category 
    }
}
