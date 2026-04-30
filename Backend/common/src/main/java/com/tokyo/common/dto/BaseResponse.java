package com.tokyo.common.dto;

import lombok.Builder;

@Builder
public record BaseResponse(
        Boolean success,
        String message,
        Integer value,
        Object data
){}
