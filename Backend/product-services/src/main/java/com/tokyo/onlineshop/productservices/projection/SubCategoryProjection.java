package com.tokyo.onlineshop.productservices.projection;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

public interface SubCategoryProjection {
    UUID getId();
    String getSubCategory();
}
