package com.tokyoonlineshop.cartservices.repository;

import com.tokyoonlineshop.cartservices.entity.CartDetail;
import com.tokyoonlineshop.cartservices.projection.CartDetailProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface CartDetailRepository extends JpaRepository<CartDetail, UUID> {

    public boolean existsByProductId(UUID productId);

    @Query(
            """
            SELECT 
            cd.productId as getProductId,
            cd.unitPrice as getPrice,
            cd.quantity as getQuantity,
            cd.productUnitId as getProductUnitId
            FROM CartDetail cd
            WHERE cd.cart.id = :cartId
            """
    )
    List<CartDetailProjection> getCartList(@Param("cartId")UUID cartId);
}
