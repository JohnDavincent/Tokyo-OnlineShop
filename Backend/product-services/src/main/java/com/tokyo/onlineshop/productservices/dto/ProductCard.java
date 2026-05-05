package com.tokyo.onlineshop.productservices.dto;

import com.tokyo.common.ProductionStatus;
import lombok.Builder;

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
