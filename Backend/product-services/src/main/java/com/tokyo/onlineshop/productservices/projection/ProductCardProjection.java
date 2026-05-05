package com.tokyo.onlineshop.productservices.projection;

import com.tokyo.common.ProductionStatus;

import java.util.UUID;

public interface ProductCardProjection {
    UUID getProductId();
    String getProductName();
    String getCategoryName();
    ProductionStatus getProductStatus();
    String getImageUrl();

}
