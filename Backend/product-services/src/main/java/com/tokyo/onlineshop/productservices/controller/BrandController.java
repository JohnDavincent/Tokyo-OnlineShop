package com.tokyo.onlineshop.productservices.controller;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.onlineshop.productservices.service.BrandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/tokyo/gropup/brand")
@RequiredArgsConstructor
@Tag(name = "Brand", description = "Public operations for browsing product brands")
public class BrandController {

    private final BrandService brandService;

    @Operation(
            summary = "Get brand list",
            description = "### Section: Brand\n" +
                    "**Request:** Retrieve the full list of available product brands.\n" +
                    "**Response:** Returns a BaseResponse containing the list of brands."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Brand list retrieved successfully",
                    content = @Content(schema = @Schema(implementation = BaseResponse.class)))
    })
    @GetMapping("/list-brand")
    public ResponseEntity<BaseResponse> getBrandList() {
        BaseResponse response = brandService.getBrandList();
        return ResponseEntity.ok(response);
    }

}
