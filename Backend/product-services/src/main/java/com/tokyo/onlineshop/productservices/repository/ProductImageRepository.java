package com.tokyo.onlineshop.productservices.repository;

import com.tokyo.onlineshop.productservices.ImageStatus;
import com.tokyo.onlineshop.productservices.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface ProductImageRepository extends JpaRepository<ProductImage, UUID> {
    public boolean existsByUrl(String url);

}
