package com.tokyo.onlineshop.productservices.controller;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.onlineshop.productservices.dto.GetProductClientResponse;
import com.tokyo.onlineshop.productservices.dto.GetProductUnitResponse;
import com.tokyo.onlineshop.productservices.dto.RequestProductListDto;
import com.tokyo.onlineshop.productservices.service.ProductService;
import com.tokyo.onlineshop.productservices.service.ProductUnitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/tokyo/gropup/product")
@RequiredArgsConstructor
@Tag(name = "Product", description = "Public operations for browsing and querying products")
public class ProductController {

    private final ProductService productService;
    private final ProductUnitService productUnitService;

    @Operation(
            summary = "Get featured products",
            description = "### Section: Product\n" +
                    "**Request:** Retrieve the list of featured products for the home page.\n" +
                    "**Response:** Returns a BaseResponse containing the featured product list."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Featured products retrieved successfully",
                    content = @Content(schema = @Schema(implementation = BaseResponse.class)))
    })
    @GetMapping()
    public ResponseEntity<BaseResponse> getProductHomeList() {
        BaseResponse response = productService.getProductListFeatured();
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get new arrivals",
            description = "### Section: Product\n" +
                    "**Request:** Retrieve the list of latest product arrivals.\n" +
                    "**Response:** Returns a BaseResponse containing the new arrival product list."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "New arrival products retrieved successfully",
                    content = @Content(schema = @Schema(implementation = BaseResponse.class)))
    })
    @GetMapping("arrival")
    public ResponseEntity<BaseResponse> getProductArrivalList() {
        BaseResponse response = productService.getLastArrivalProductList();
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get product detail",
            description = "### Section: Product\n" +
                    "**Request:** Retrieve detailed information for a specific product by its ID.\n" +
                    "**Response:** Returns a BaseResponse containing product details, units, and images."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Product detail retrieved successfully",
                    content = @Content(schema = @Schema(implementation = BaseResponse.class))),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    @GetMapping("/detail/{id}")
    public ResponseEntity<BaseResponse> getProductDetail(
            @Parameter(description = "Product UUID", required = true)
            @PathVariable UUID id) {
        BaseResponse response = productService.getProductDetail(id);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get products by category",
            description = "### Section: Product\n" +
                    "**Request:** Retrieve paginated products belonging to a specific category.\n" +
                    "**Response:** Returns a BaseResponse containing paginated product list."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Products retrieved successfully",
                    content = @Content(schema = @Schema(implementation = BaseResponse.class))),
            @ApiResponse(responseCode = "404", description = "Category not found")
    })
    @GetMapping("/category-list/{categoryId}")
    public ResponseEntity<BaseResponse> getProductByCategory(
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0", name = "current-pages") int currPages,
            @Parameter(description = "Number of items per page", example = "10")
            @RequestParam(defaultValue = "10", name = "size") int size,
            @Parameter(description = "Category UUID", required = true)
            @PathVariable("categoryId") UUID categoryId
    ) {
        BaseResponse response = productService.getProductByCategory(categoryId, currPages, size);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get filtered product list",
            description = "### Section: Product\n" +
                    "**Request:** Retrieve a filtered and paginated product list based on request criteria.\n" +
                    "**Response:** Returns a BaseResponse containing the filtered product list."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Product list retrieved successfully",
                    content = @Content(schema = @Schema(implementation = BaseResponse.class)))
    })
    @PostMapping("/list")
    public ResponseEntity<BaseResponse> getProductList(@RequestBody RequestProductListDto requestDto) {
        BaseResponse response = productService.getProductList(requestDto);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get product by ID (internal)",
            description = "### Section: Product\n" +
                    "**Request:** Retrieve a product by ID for internal service communication (e.g., cart service).\n" +
                    "**Response:** Returns GetProductClientResponse with product details."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Product retrieved successfully",
                    content = @Content(schema = @Schema(implementation = GetProductClientResponse.class))),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    @GetMapping("/{id}")
    public GetProductClientResponse getProduct(
            @Parameter(description = "Product UUID", required = true)
            @PathVariable("id") UUID productId) {
        return productService.getProduct(productId);
    }

    @Operation(
            summary = "Get product units",
            description = "### Section: Product\n" +
                    "**Request:** Retrieve specific unit details for a product by product ID and unit IDs.\n" +
                    "**Response:** Returns a list of GetProductUnitResponse containing unit details."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Product units retrieved successfully",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = GetProductUnitResponse.class)))),
            @ApiResponse(responseCode = "404", description = "Product or unit not found")
    })
    @PostMapping("/unit/{productId}")
    public List<GetProductUnitResponse> getUnit(
            @RequestBody List<UUID> unitId,
            @Parameter(description = "Product UUID", required = true)
            @PathVariable("productId") UUID productId) {
        return productUnitService.getUnit(unitId, productId);
    }

    @Operation(
            summary = "Get products by IDs (internal)",
            description = "### Section: Product\n" +
                    "**Request:** Retrieve multiple products by their IDs for internal service communication.\n" +
                    "**Response:** Returns a list of GetProductClientResponse."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Products retrieved successfully",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = GetProductClientResponse.class))))
    })
    @PostMapping("/list-by-ids")
    public List<GetProductClientResponse> getProductListByIds(@RequestBody List<UUID> productIds) {
        return productService.getProductListByIds(productIds);
    }

}
