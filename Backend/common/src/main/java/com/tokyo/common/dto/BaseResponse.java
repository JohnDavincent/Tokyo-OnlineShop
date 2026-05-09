package com.tokyo.common.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import org.springframework.http.HttpStatus;

@Builder
@Schema(description = "Standard API response wrapper used across all services")
public record BaseResponse(
        @Schema(description = "HTTP status code number", example = "200")
        Integer status,
        @Schema(description = "HTTP status enum", example = "OK")
        HttpStatus code,
        @Schema(description = "Response message", example = "Success")
        String message,
        @Schema(description = "Response payload data")
        Object data
){}
