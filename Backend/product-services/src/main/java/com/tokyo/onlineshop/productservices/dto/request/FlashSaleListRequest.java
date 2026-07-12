package com.tokyo.onlineshop.productservices.dto.request;

import com.tokyo.common.dto.PagingRequest;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Builder
@Getter
@Setter
public class FlashSaleListRequest extends PagingRequest {
    private String search;
    private LocalDate startDate;
    private LocalDate endDate;
    private String searchCategory;
    private String searchSubCategory;
}
