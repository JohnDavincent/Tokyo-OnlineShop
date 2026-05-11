package com.tokyo.onlineshop.productservices.repository;

import com.tokyo.onlineshop.productservices.entity.Product;
import com.tokyo.onlineshop.productservices.projection.ProductCardProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {

    public boolean existsByName(String name);

    @Query(
            """
            SELECT DISTINCT p
            FROM Product p
            LEFT JOIN FETCH p.productImageList
            LEFT JOIN p.productUnitList
            WHERE p.isFeaturedPage = true
            ORDER BY p.name
            LIMIT 8
            """
    )
    public List<Product> listOfFeaturedPageProduct();

    @Query(
            """
            SELECT DISTINCT p
            FROM Product p
            LEFT JOIN FETCH p.productImageList
            LEFT JOIN p.productUnitList
            ORDER BY p.createdAt DESC
            LIMIT 8
            """
    )
    public List<Product> listOfArrivalProduct();

    @Query(
            value = """
            SELECT
                p.id as productId,
                p.name as productName,
                p.status as productStatus,
                pi.url as imageUrl,
                c.name as categoryName
            FROM Product p
            LEFT JOIN p.productImageList pi
            JOIN p.category c
            WHERE c.parentId = :categoryId
            """,
            countQuery = """
                    SELECT COUNT(DISTINCT p.id)
                    FROM Product p
                    JOIN p.category c
                    WHERE c.parentId = :categoryId
                    """
    )
    Page<ProductCardProjection> getProductWithCategoryId(UUID categoryId, Pageable pageable);

    @Query("""
            SELECT DISTINCT p
            FROM Product p
            LEFT JOIN FETCH p.productImageList
            WHERE p.id IN :ids
            """)
    List<Product> findAllByIdWithImages(@Param("ids") List<UUID> ids);

}
