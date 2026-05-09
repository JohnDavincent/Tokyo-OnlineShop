package com.tokyo.onlineshop.productservices.controller;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.onlineshop.productservices.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/tokyo/gropup/category")
@RequiredArgsConstructor
@Tag(name = "Category", description = "Public operations for browsing product categories")
public class CategoryController {

    private final CategoryService categoryService;

    @Operation(
            summary = "Get category list",
            description = "### Section: Category\n" +
                    "**Request:** Retrieve the full list of product categories.\n" +
                    "**Response:** Returns a BaseResponse containing the list of categories."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Category list retrieved successfully",
                    content = @Content(schema = @Schema(implementation = BaseResponse.class)))
    })
    @GetMapping("/list-category")
    public ResponseEntity<BaseResponse> getCategoryList() {
        BaseResponse response = categoryService.getCategoryList();
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get subcategory list",
            description = "### Section: Category\n" +
                    "**Request:** Retrieve subcategories for a given parent category ID.\n" +
                    "**Response:** Returns a BaseResponse containing the list of subcategories."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Subcategory list retrieved successfully",
                    content = @Content(schema = @Schema(implementation = BaseResponse.class))),
            @ApiResponse(responseCode = "404", description = "Parent category not found")
    })
    @GetMapping("/list-subcategory/{parentId}")
    public ResponseEntity<BaseResponse> getSubCategoryList(
            @Parameter(description = "Parent category UUID", required = true)
            @PathVariable("parentId") UUID parentId) {
        BaseResponse response = categoryService.getSubCategoryList(parentId);
        return ResponseEntity.ok(response);
    }

}
