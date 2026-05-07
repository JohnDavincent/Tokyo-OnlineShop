package com.tokyoonlineshop.cartservices.repository;

import com.tokyoonlineshop.cartservices.entity.CartDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CartDetailRepository extends JpaRepository<CartDetail, UUID> {

    boolean existsByProductId(UUID productId);

    List<CartDetail> findByCartId(UUID cartId);
}
