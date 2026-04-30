package com.tokyo.onlineshop.productservices.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Builder;

import java.io.Serializable;

@Builder

@JsonPropertyOrder({"items","total_pages,","total_items","current_page","page_size"})
public record PageResponse(

        Object items,

        @JsonProperty("total_pages")
        int totalPages,

        @JsonProperty("current_page")
        int currentPage,

        @JsonProperty("page_size")
        int pageSize,

        @JsonProperty("total_items")
        Long totalItems

) implements Serializable {
}
