package com.tokyo.onlineshop.productservices.repository;

import com.tokyo.onlineshop.productservices.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, UUID> {
    boolean existsByName(String name);
    boolean existsByCode(String code);
}
