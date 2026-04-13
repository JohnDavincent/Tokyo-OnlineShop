package com.tokyo.onlineshop.productservices.entity;

import com.tokyo.onlineshop.entity.BaseEntity;
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
@Table(name = "categories")
public class Category extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "parent_category")
    private UUID parent_id;

    @Column(name = "category_name")
    private String name;

    @Column(name ="slug", unique = true, nullable = false)
    private String slug;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ProductionStatus status;

    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY, cascade = {CascadeType.MERGE,CascadeType.PERSIST})
    private List<Product> productList = new ArrayList<>();

}
