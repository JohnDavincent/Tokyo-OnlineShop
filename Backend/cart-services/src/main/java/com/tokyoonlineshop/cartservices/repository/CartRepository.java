package com.tokyoonlineshop.cartservices.repository;

import com.tokyoonlineshop.cartservices.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CartRepository extends JpaRepository<Cart, UUID> {
}
