package com.tokyo.onlineshop.productservices.repository;

import com.tokyo.onlineshop.productservices.entity.ProductFlashSale;
import com.tokyo.onlineshop.productservices.enums.FlashSaleStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ProductFlashSaleRepository extends JpaRepository<ProductFlashSale, UUID> {
    boolean existsByProductUnit_Id(UUID productId);

    List<ProductFlashSale> findAllByStatusAndStartFlashSaleDateLessThanEqual(FlashSaleStatus status, LocalDateTime now);
    List<ProductFlashSale> findAllByStatusAndEndFlashSaleDateLessThanEqual(FlashSaleStatus status, LocalDateTime now);
}
