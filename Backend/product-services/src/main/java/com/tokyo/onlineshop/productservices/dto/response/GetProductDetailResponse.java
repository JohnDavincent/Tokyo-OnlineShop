package com.tokyo.onlineshop.productservices.dto.response;

import com.tokyo.common.ProductionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GetProductDetailResponse {

    private UUID id;
    private String name;
    private String sku;
    private Integer stock;
    private Integer baseWeight;
    private ProductionStatus status;
    private String brand;
    private String category;
    private String subCategory;
    private String description;
    private List<CreateImageResponse> imageList;
    private List<CreateUnitResponse> unitList;

}
