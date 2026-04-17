package com.tokyo.onlineshop.productservices.entity;

import com.tokyo.onlineshop.productservices.ImageStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@Entity
@Table(name = "product_images")
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "is_primary")
    private Boolean isPrimary;

    @Column(name = "url")
    private String url;

    @ManyToOne
    @JoinColumn(name = "products_id")
    private Product product;

    @Column(name = "alt_text")
    private String altText;

}
