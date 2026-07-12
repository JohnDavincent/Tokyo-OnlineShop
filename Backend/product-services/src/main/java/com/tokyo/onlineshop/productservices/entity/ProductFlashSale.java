package com.tokyo.onlineshop.productservices.entity;

import com.tokyo.common.entity.BaseEntity;
import com.tokyo.onlineshop.productservices.enums.FlashSaleStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Builder
@Getter
@Setter
@Entity
@Table(name = "product_flash_sale")
@AllArgsConstructor
@NoArgsConstructor
public class ProductFlashSale extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "product_unit_id")
    private ProductUnit productUnit;

    @Column(name = "flash_sale_price")
    private BigDecimal flashSalePrice;

    @Column(name = "status")
    private FlashSaleStatus status;

    @Column(name = "start_flash_sale_date")
    private LocalDateTime startFlashSaleDate;

    @Column(name = "end_flash_sale_date")
    private LocalDateTime EndFlashSaleDate;

}
