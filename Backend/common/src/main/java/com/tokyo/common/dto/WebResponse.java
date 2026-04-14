package com.tokyo.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Builder
public record WebResponse<T>(
        Boolean success,
        String message,
        Integer value,
        T data
) {}
