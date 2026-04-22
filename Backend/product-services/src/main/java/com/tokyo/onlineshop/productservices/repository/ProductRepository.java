package com.tokyo.onlineshop.productservices.repository;

import com.tokyo.onlineshop.productservices.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {

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
}
