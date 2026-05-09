package com.tokyo.onlineshop.productservices.controller;


import com.tokyo.common.dto.BaseResponse;
import com.tokyo.onlineshop.productservices.dto.*;
import com.tokyo.onlineshop.productservices.service.BrandService;
import com.tokyo.onlineshop.productservices.service.CategoryService;
import com.tokyo.onlineshop.productservices.service.ProductImageService;
import com.tokyo.onlineshop.productservices.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/tokyo/gropup/ad-min")
@Tag(name = "Admin - Product Management", description = "Admin-only operations for managing categories, brands, products, and images")
@SecurityRequirement(name = "Bearer Authentication")
public class AdminController {

    private final CategoryService categoryService;
    private final ProductService productService;
    private final BrandService brandService;
    private final ProductImageService productImageService;

    @Operation(
            summary = "Create category",
            description = "### Section: Admin - Product Management\n" +
                    "**Request:** Create a new product category with name and optional parent category.\n" +
                    "**Response:** Returns a BaseResponse containing the created category details."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Category created successfully",
                    content = @Content(schema = @Schema(implementation = BaseResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token missing or invalid"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN role")
    })
    @PostMapping("/category")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse> createCategory(@RequestBody CreateCategoryRequest request) {
        BaseResponse response = categoryService.CreateCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "Create brand",
            description = "### Section: Admin - Product Management\n" +
                    "**Request:** Create a new product brand.\n" +
                    "**Response:** Returns a BaseResponse containing the created brand details."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Brand created successfully",
                    content = @Content(schema = @Schema(implementation = BaseResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token missing or invalid"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN role")
    })
    @PostMapping("/brand")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse> createBrand(@RequestBody CreateBrandRequest request) {
        BaseResponse response = brandService.createBrand(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "Create product",
            description = "### Section: Admin - Product Management\n" +
                    "**Request:** Create a new product with details, SKU, stock, weight, brand, category, units, and images.\n" +
                    "**Response:** Returns a BaseResponse containing the created product details."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Product created successfully",
                    content = @Content(schema = @Schema(implementation = BaseResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token missing or invalid"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN role")
    })
    @PostMapping("/product")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse> createProduct(@Valid @RequestBody CreateProductRequest req) {
        BaseResponse response = productService.createProduct(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "Upload category image",
            description = "### Section: Admin - Product Management\n" +
                    "**Request:** Upload an image for a specific category by category ID.\n" +
                    "**Response:** Returns a BaseResponse containing the uploaded image details."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Category image uploaded successfully",
                    content = @Content(schema = @Schema(implementation = BaseResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid file or category not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token missing or invalid"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN role")
    })
    @PostMapping(
            value = "/category/add-image/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse> addImage(
            @Parameter(description = "Category ID to attach image to", required = true)
            @PathVariable UUID id,
            @Parameter(description = "Image file to upload", required = true)
            @RequestPart("images") MultipartFile file) {
        BaseResponse response = categoryService.createImage(id, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "Upload product images",
            description = "### Section: Admin - Product Management\n" +
                    "**Request:** Upload multiple images for a product identified by slug. Optional alt text can be provided for each image.\n" +
                    "**Response:** Returns a BaseResponse containing the uploaded product image details."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Product images uploaded successfully",
                    content = @Content(schema = @Schema(implementation = BaseResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid file or product not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token missing or invalid"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN role")
    })
    @PostMapping(value = "/ad-min/product/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse> uploadProductImage(
            @Parameter(description = "Product slug identifier", required = true)
            @RequestParam("slug") String slug,
            @Parameter(description = "List of image files to upload", required = true)
            @RequestPart("images") List<MultipartFile> images,
            @Parameter(description = "Optional alt text for each image")
            @RequestParam(value = "altText", required = false) List<String> altText
    ) {
        BaseResponse response = productImageService.uploadImage(slug, images, altText);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

}
