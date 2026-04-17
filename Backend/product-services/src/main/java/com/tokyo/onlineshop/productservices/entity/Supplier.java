package com.tokyo.onlineshop.productservices.entity;

import com.tokyo.common.entity.BaseEntity;
import com.tokyo.onlineshop.productservices.ProductionStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "supplier")
public class Supplier extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "supplier_name", nullable = false, unique = true)
    private String name;

    @Column(name = "supplier_code", unique = true)
    private String code;

    @Column(name = "slug",nullable = false,unique = true)
    private String slug;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ProductionStatus status;

    @Column(name = "phone_number")
    private String phoneNumber;


}
