package com.tokyo.onlineshop.productservices.service;

import com.tokyo.onlineshop.productservices.ProductionStatus;
import com.tokyo.onlineshop.productservices.dto.CreateCategoryRequest;
import com.tokyo.onlineshop.productservices.dto.CreateCategoryResponse;
import com.tokyo.onlineshop.productservices.entity.Category;
import com.tokyo.onlineshop.productservices.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class CategoryServiceImp implements CategoryService{

    private final CategoryRepository categoryRepository;
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
                .slug(slug)
                .build();

        if(request.getParent_id() != null) {
            if(!categoryRepository.existsById(request.getParent_id())){
                throw new RuntimeException("Parent category not found");
            }
            createCategory.setParent_id(request.getParent_id());
        }
        categoryRepository.save(createCategory);

        return CreateCategoryResponse.builder()
                .id(createCategory.getId())
                .status(createCategory.getStatus())
                .slug(createCategory.getSlug())
                .build();
    }
}
