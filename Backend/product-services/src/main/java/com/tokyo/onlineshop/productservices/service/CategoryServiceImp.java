package com.tokyo.onlineshop.productservices.service;

import com.tokyo.onlineshop.productservices.ProductionStatus;
import com.tokyo.onlineshop.productservices.dto.*;
import com.tokyo.onlineshop.productservices.entity.Category;
import com.tokyo.onlineshop.productservices.entity.Product;
import com.tokyo.onlineshop.productservices.helper.ImageFileHelper;
import com.tokyo.onlineshop.productservices.repository.CategoryRepository;
import com.tokyo.onlineshop.productservices.repository.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryServiceImp implements CategoryService{

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ImageFileHelper helper;

    @Value("${app.upload.dir-pc}")
    private String uploadDir;


    @Transactional
    @Override
    public CreateCategoryResponse CreateCategory(CreateCategoryRequest request) {
        if(request == null || request.getName() == null || request.getName().isBlank()){
            throw new RuntimeException("Please fill the field!");
        }

        if(categoryRepository.existsByName(request.getName())){
           throw new RuntimeException("Category already register with that name");
        }


        String normalize = request.getName().strip();
        String slug = normalize.toLowerCase(Locale.ROOT).replaceAll("//s+","-");

        Category createCategory = Category.builder()
                .name(request.getName())
                .status(ProductionStatus.AVAILABLE)
                .imageurl("")
                .slug(slug)
                .build();

        if(request.getParent_id() != null) {
            if (!categoryRepository.existsById(request.getParent_id())) {
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
                .imageUrl(createCategory.getImageurl())
                .build();
    }

    @Override
    public CreateCategoryImageResponse createImage(UUID categoryId, MultipartFile file) {
        Category existParentCategory = categoryRepository.findById(categoryId).orElseThrow(() -> new RuntimeException("Product Not Found"));
        try{
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);
            String fileName = helper.createImageFileName(existParentCategory.getSlug(),file);
            String url = "/image/category/" + fileName;
            Path target = uploadPath.resolve(fileName);
            file.transferTo(target.toFile());

            existParentCategory.setImageurl(url);

            categoryRepository.save(existParentCategory);
        }catch(IOException e){
            throw new RuntimeException("Failed to save the image", e);
        }

        return CreateCategoryImageResponse.builder()
                .categoryName(existParentCategory.getName())
                .imageUrl(existParentCategory.getImageurl())
                .build();
    }

    @Override
    public List<CategoryListResponse> getCategoryList() {
       List<Category> mainCategory = categoryRepository.getCategoryList();
       if(mainCategory == null || mainCategory.isEmpty()){
           throw new RuntimeException("Category is not found");
       }

       return mainCategory.stream()
               .map(category ->
                       {
                           return  CategoryListResponse.builder()
                                   .id(category.getId())
                                   .categoryName(category.getName())
                                   .imageUrl(category.getImageurl())
                                   .altText(category.getAlt_text())
                                   .build();
                       }
                 ).toList();
    }

}
