package com.tokyo.onlineshop.productservices.repository;

import com.tokyo.onlineshop.productservices.entity.ProductUnit;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductUnitRepository extends JpaRepository<ProductUnit, UUID>, JpaSpecificationExecutor<ProductUnit> {

    public Boolean existsByUnit(String unit);

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

    public List<ProductUnit> findByProductIdIn(List<UUID> productId);
    public Optional<ProductUnit> findByIdAndProduct_Id(UUID unitId, UUID productId);
    public Optional<ProductUnit> findByProduct_IdAndUnit(UUID productId, String unit);
    public List<ProductUnit> findByProduct_Id(UUID productId);
    public void deleteByProduct_Id(UUID productId);

//    @Modifying
//    @Query("""
//            UPDATE ProductUnit pu
//            SET pu.flashSalePrice = NULL,
//                pu.flashSaleUntil = NULL
//            WHERE pu.flashSaleUntil IS NOT NULL
//              AND pu.flashSaleUntil < :now
//            """)
//    int expireFlashSales(@Param("now") LocalDateTime now);

//    @Query(
//            """
//            SELECT pu from ProductUnit pu
//            JOIN pu.product p
//            WHERE p.isFlashSale = true
//            AND pu.flashSalePrice IS NOT NULL
//            """
//    )
//    Page<ProductUnit> getProductWithFlashSale();
}
