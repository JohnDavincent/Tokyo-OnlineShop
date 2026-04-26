package com.tokyo.onlineshop.productservices.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class GetProductDetailResponse {

    private String name;
    private String sku;
    private Integer stock;
    private Integer baseWeight;
    private String brand;
    private String category;
    private String subCategory;
    private String description;
    private List<CreateImageResponse> imageList;
    private List<CreateUnitResponse> unitList;

}
