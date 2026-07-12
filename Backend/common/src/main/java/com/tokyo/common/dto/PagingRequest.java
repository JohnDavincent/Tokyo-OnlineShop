package com.tokyo.common.dto;

import lombok.*;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PagingRequest {
    int pageSize = 10;
    int currentPage = 0;
    String sortBy = "created_time";
    String sort = "DESC";
    boolean pageable = true;
}
