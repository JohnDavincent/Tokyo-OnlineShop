package com.tokyo.onlineshop.productservices.repository;

import com.tokyo.onlineshop.productservices.entity.ProductUnit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProductUnitCategory extends JpaRepository<ProductUnit, UUID> {
}
