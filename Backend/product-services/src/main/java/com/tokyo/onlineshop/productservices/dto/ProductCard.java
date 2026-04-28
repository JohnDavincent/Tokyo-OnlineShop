package com.tokyo.onlineshop.productservices.dto;

import com.tokyo.onlineshop.productservices.ProductionStatus;
import com.tokyo.onlineshop.productservices.entity.ProductUnit;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;


@Builder
public record ProductCard(
        UUID productId,
        String productName,
        ProductionStatus status,
        String url,
        String altText,
        String category,
        List<UnitCard> unitList
) {}
