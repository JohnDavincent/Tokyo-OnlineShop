package com.tokyo.onlineshop.productservices.repository;

import com.tokyo.onlineshop.productservices.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    boolean existsByName(String name);

    @Query(
          """
          SELECT COUNT(c) > 0
          FROM Category c WHERE c.id = :parentId
          """
    )
    Boolean checkParentId(@Param("parentId") UUID parentId);

    @Query(
            """
            SELECT c.subCategory
            FROM Category c
            WHERE c.parentId = :categoryId
            """
    )
    List<String> getSubCategoryList(@Param("categoryId") UUID categoryId);

    Category findByIdAndSubCategory(UUID id, String subCategory);
}
