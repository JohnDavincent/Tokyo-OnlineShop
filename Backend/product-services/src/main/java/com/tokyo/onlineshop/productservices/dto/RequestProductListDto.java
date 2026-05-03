package com.tokyo.onlineshop.productservices.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestProductListDto {
    private Integer currentPage ;
    private Integer pageSize ;
    private String sortBy ;
    private String sortOrder;
    private ProductFilterRequestDto requestDto;

    public Integer getCurrentPage() {
        return currentPage != null ? currentPage : 0;
    }

    public Integer getPageSize() {
        return pageSize != null ? pageSize : 10;
    }

    public String getSortBy() {
        return sortBy != null ? sortBy : "name";
    }

    public String getSortOrder() {
        return sortOrder != null ? sortOrder : "ASC";
    }
}
