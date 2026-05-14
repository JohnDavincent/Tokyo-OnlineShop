package com.tokyo.onlineshop.transactionservices.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "transaction_detail")
public class TransactionDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "product_id")
    private UUID productId;

    @Column(name = "product_unit_id")
    private UUID productUnitId;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "product_unit")
    private String productUnit;

    @Column(name = "price")
    private BigDecimal price;

    @Column(name = "sub_total")
    private BigDecimal subtotal;

    @Column(name = "quantity")
    private Integer quantity;

    @ManyToOne
    @JoinColumn(name = "transactions_id")
    private Transaction transaction;
}

