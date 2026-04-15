package com.tokyo.onlineshop.productservices.entity;

import com.tokyo.common.entity.BaseEntity;
import com.tokyo.onlineshop.productservices.ProductionStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "products")
public class Product extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "product_name")
    private String name;

    @Column(name = "sku")
    private String sku;

    @Column(name = "description")
    private String description;

    @Column(name = "stock")
    private Integer stock;

    @Column(name = "base_wight_unit")
    private Integer baseWeightUnit;

    @Column(name = "base_unit")
    private String baseUnit;

    @Enumerated(EnumType.STRING)
    @Column(name = "Product_status")
    private ProductionStatus status;

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY,cascade = {CascadeType.PERSIST,CascadeType.MERGE})
    private List<ProductUnit> productUnitList = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "categories_id")
    private Category category;

    @ManyToOne
    @JoinColumn(name = "brands_id")
    private Brand brand;

    public void addProductUnit(ProductUnit unit){
        productUnitList.add(unit);
    }


}
