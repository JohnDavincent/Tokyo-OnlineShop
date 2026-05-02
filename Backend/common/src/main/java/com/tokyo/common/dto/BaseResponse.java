package com.tokyo.common.dto;

import lombok.Builder;
import org.springframework.http.HttpStatus;

@Builder
public record BaseResponse(
        Integer status,
        HttpStatus code,
        String message,
        Object data
){}
