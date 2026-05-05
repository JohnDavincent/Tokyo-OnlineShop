package com.tokyoonlineshop.cartservices.repository;

import com.tokyoonlineshop.cartservices.entity.CartDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CartDetailRepository extends JpaRepository<CartDetail, UUID> {

    public boolean existsByProductId(UUID productId);
}
