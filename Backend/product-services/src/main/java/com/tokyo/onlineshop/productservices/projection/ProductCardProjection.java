package com.tokyo.onlineshop.productservices.projection;

import com.tokyo.onlineshop.productservices.ProductionStatus;
import com.tokyo.onlineshop.productservices.entity.ProductUnit;

import java.util.List;
import java.util.UUID;

public interface ProductCardProjection {
    UUID getProductId();
    String getProductName();
    String getCategoryName();
    ProductionStatus getProductStatus();
    String getImageUrl();

}
