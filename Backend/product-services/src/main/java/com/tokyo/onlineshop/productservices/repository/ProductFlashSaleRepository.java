package com.tokyo.onlineshop.productservices.repository;

import com.tokyo.onlineshop.productservices.entity.ProductFlashSale;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProductFlashSaleRepository extends JpaRepository<ProductFlashSale, UUID> {
    boolean existsByProductUnit_Id(UUID productId);
}
