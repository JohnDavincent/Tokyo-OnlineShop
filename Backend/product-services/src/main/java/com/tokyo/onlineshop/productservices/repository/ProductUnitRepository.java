package com.tokyo.onlineshop.productservices.repository;

import com.tokyo.onlineshop.productservices.entity.Product;
import com.tokyo.onlineshop.productservices.entity.ProductUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ProductUnitRepository extends JpaRepository<ProductUnit, UUID> {

    public Boolean existsByUnit(String unit);
    //public Optional<ProductUnit> findByProduct_ProductId(UUID productId);
    @Query(
            """
            SELECT COUNT(pu) > 0
            FROM ProductUnit pu
            WHERE pu.unit = :existUnit
            AND pu.convertQuantity = :quantity
            AND pu.product.id = :productId
            """
    )
    public boolean existsByUnitAndQuantity(@Param("existUnit") String existUnit, @Param("quantity") Integer quantity, @Param("productId") UUID productId);
}
