package com.tokyo.onlineshop.productservices.controller;


import com.tokyo.common.dto.BaseResponse;
import com.tokyo.onlineshop.productservices.dto.request.CreateBrandRequest;
import com.tokyo.onlineshop.productservices.dto.request.CreateCategoryRequest;
import com.tokyo.onlineshop.productservices.dto.request.CreateProductRequest;
import com.tokyo.onlineshop.productservices.dto.request.FlashSaleRequest;
import com.tokyo.onlineshop.productservices.service.BrandService;
import com.tokyo.onlineshop.productservices.service.CategoryService;
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
                    "**Request:** multipart/form-data with a `metadata` JSON part (product details, SKU, stock, weight, brand, category, units, altTexts) and an optional `images` part carrying image files.\n" +
                    "**Response:** Returns a BaseResponse containing the created product details."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Product created successfully",
                    content = @Content(schema = @Schema(implementation = BaseResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token missing or invalid"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN role"),
            @ApiResponse(responseCode = "409", description = "Product name or SKU already exists")
    })
    @PostMapping(value = "/product", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse> createProduct(
            @Parameter(description = "Product metadata JSON", required = true)
            @Valid @RequestPart("metadata") CreateProductRequest metadata,
            @Parameter(description = "Image files (order maps to metadata.altTexts)")
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        BaseResponse response = productService.createProduct(metadata, images);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "Update product",
            description = "### Section: Admin - Product Management\n" +
                    "**Request:** multipart/form-data with a `metadata` JSON part (same shape as create) and an optional `images` part. If `images` is omitted, existing images are kept; if provided, existing images are replaced. Units are always replaced from `metadata.unitList`. Validation runs fully before any DB write.\n" +
                    "**Response:** Returns a BaseResponse containing the updated product details."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Product updated successfully",
                    content = @Content(schema = @Schema(implementation = BaseResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token missing or invalid"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN role"),
            @ApiResponse(responseCode = "404", description = "Product, brand, category, or sub-category not found"),
            @ApiResponse(responseCode = "409", description = "Product name or SKU already exists on another product")
    })
    @PutMapping(value = "/product/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse> updateProduct(
            @Parameter(description = "Product UUID", required = true)
            @PathVariable UUID id,
            @Parameter(description = "Product metadata JSON", required = true)
            @Valid @RequestPart("metadata") CreateProductRequest metadata,
            @Parameter(description = "Image files (order maps to metadata.altTexts)")
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        BaseResponse response = productService.updateProduct(id, metadata, images);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Mark product as NEW",
            description = "### Section: Admin - Product Management\n" +
                    "**Request:** Mark an existing product as NEW for 1 week.\n" +
                    "**Response:** Returns a BaseResponse containing the updated product status and newMarkedAt."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Product marked as NEW successfully",
                    content = @Content(schema = @Schema(implementation = BaseResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid product ID"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token missing or invalid"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN role"),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    @PostMapping("/product/{id}/mark-new")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse> markProductAsNew(
            @Parameter(description = "Product UUID", required = true)
            @PathVariable UUID id) {
        BaseResponse response = productService.markProductAsNew(id);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Mark product as FLASH_SALE",
            description = "### Section: Admin - Product Management\n" +
                    "**Request:** Mark a product as FLASH_SALE. Optional flashSaleUntil sets auto-expiry; omit for manual mode.\n" +
                    "**Response:** Returns a BaseResponse containing the updated product status and flashSaleUntil."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Product marked as FLASH_SALE successfully",
                    content = @Content(schema = @Schema(implementation = BaseResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token missing or invalid"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN role"),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    @PostMapping("/product/{id}/flash-sale")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse> markProductAsFlashSale(
            @Parameter(description = "Product UUID", required = true)
            @PathVariable UUID id,
            @Valid @RequestBody(required = false) FlashSaleRequest request) {
        BaseResponse response = productService.markProductAsFlashSale(id, request);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "End product flash sale",
            description = "### Section: Admin - Product Management\n" +
                    "**Request:** Manually revert a product from FLASH_SALE back to AVAILABLE.\n" +
                    "**Response:** Returns a BaseResponse containing the updated product status."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Flash sale ended successfully",
                    content = @Content(schema = @Schema(implementation = BaseResponse.class))),
            @ApiResponse(responseCode = "400", description = "Product is not in FLASH_SALE status"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token missing or invalid"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN role"),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    @PostMapping("/product/{id}/end-flash-sale")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse> endFlashSale(
            @Parameter(description = "Product UUID", required = true)
            @PathVariable UUID id) {
        BaseResponse response = productService.endFlashSale(id);
        return ResponseEntity.ok(response);
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

}
