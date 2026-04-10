package com.tokyo.onlineshop.productservices.entity;

import com.tokyo.onlineshop.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "product_units")
public class ProductUnit extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "product_unit")
    private String unit;

    @Column(name = "convert_quantity")
    private Integer convertQuantity;

    @Column (name = "product_base_unit_price")
    private BigDecimal unitBasePrice;

    @Column(name = "product_sell_unit_price")
    private BigDecimal unitSellPrice;

    @ManyToOne
    @JoinColumn(name = "products")
    private Product product;
}
