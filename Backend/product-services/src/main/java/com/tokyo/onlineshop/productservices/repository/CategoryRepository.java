package com.tokyo.onlineshop.productservices.repository;

import com.tokyo.onlineshop.productservices.entity.Category;
import com.tokyo.onlineshop.productservices.projection.SubCategoryProjection;
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
            SELECT c.name
            FROM Category c
            WHERE c.parentId = :categoryId
            """
    )
    List<String> getSubCategoryList(@Param("categoryId") UUID categoryId);

    @Query(
            """
            SELECT
            c.id as id,
            c.name as subCategory
            FROM Category c
            WHERE c.parentId = :categoryId
            """
    )
    List<SubCategoryProjection> getSubCategoryBasedOnTheParent(@Param("categoryId") UUID categoryId);

    @Query(
            """
            SELECT c
            FROM Category c
            WHERE c.parentId IS NULL
            """
    )
    List<Category> getCategoryList();

    Category findByParentIdAndName(UUID id, String subCategory);
    Optional<Category> findByParentId(UUID parentId);

    @Query(
            """
            SELECT
            c.id as id,
            c.name as subCategory
            FROM Category c
            WHERE c.parentId IS NOT NULL
            """
    )
    List<SubCategoryProjection> getAllSubCategoryList();

}
