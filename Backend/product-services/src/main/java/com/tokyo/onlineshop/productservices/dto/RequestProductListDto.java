package com.tokyo.onlineshop.productservices.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RequestProductListDto {
    int currentPage = 0;
    int pageSize = 10;
    String sortBy = "name";
    String sortOrder = "ASC";
    ProductFilterRequestDto requestDto;
}
