package com.tokyoonlineshop.cartservices.controller;

import com.tokyo.common.dto.BaseResponse;
import com.tokyoonlineshop.cartservices.dto.AddProductRequest;
import com.tokyoonlineshop.cartservices.service.CartDetailService;
import com.tokyoonlineshop.cartservices.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RequestMapping("/tokyo/gropup/cart")
@RestController
@RequiredArgsConstructor
@Tag(name = "Cart", description = "Operations related to user shopping cart management")
@SecurityRequirement(name = "Bearer Authentication")
public class CartController {

    private final CartService cartService;
    private final CartDetailService cartDetailService;

    @Operation(
            summary = "Add item to cart",
            description = "### Section: Cart\n" +
                    "**Request:** Add a product to the authenticated user's shopping cart with product ID, quantity, and optional unit selection.\n" +
                    "**Response:** Returns a BaseResponse containing the created cart item details with HTTP 201 CREATED."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Item added to cart successfully",
                    content = @Content(schema = @Schema(implementation = BaseResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request payload or product not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token missing or invalid")
    })
    @PostMapping()
    public ResponseEntity<BaseResponse> addItems(@RequestBody AddProductRequest request) {
        BaseResponse response = cartService.addProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "Get cart list",
            description = "### Section: Cart\n" +
                    "**Request:** Retrieve the current shopping cart. Works for both guests (returns empty cart message) and logged-in users.\n" +
                    "**Response:** Returns a BaseResponse containing CartListResponse with cart items and grand total, or a guest message."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Cart retrieved successfully",
                    content = @Content(schema = @Schema(implementation = BaseResponse.class)))
    })
    @SecurityRequirements({})
    @GetMapping("/list")
    public ResponseEntity<BaseResponse> getCartList() {
        BaseResponse response = cartService.getCartList();
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Update item quantity",
            description = "### Section: Cart\n" +
                    "**Request:** Update the quantity of a specific product in the user's cart. Pass 0 to remove the item.\n" +
                    "**Response:** Returns a BaseResponse confirming the quantity update."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Quantity updated successfully",
                    content = @Content(schema = @Schema(implementation = BaseResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid quantity or product not in cart"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token missing or invalid"),
            @ApiResponse(responseCode = "404", description = "Cart or product not found")
    })
    @PatchMapping("/{productId}/quantity/")
    public ResponseEntity<BaseResponse> updateQuantityCartDetail(
            @Parameter(description = "Product ID to update quantity for", required = true)
            @PathVariable("productId") UUID productId,
            @Parameter(description = "New quantity value", required = true)
            @RequestBody int quantity) {
        BaseResponse response = cartService.updateCartQuantity(productId, quantity);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Delete item from cart",
            description = "### Section: Cart\n" +
                    "**Request:** Remove a specific product from the authenticated user's shopping cart.\n" +
                    "**Response:** Returns HTTP 204 No Content on successful deletion."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Item removed from cart successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token missing or invalid"),
            @ApiResponse(responseCode = "404", description = "Cart or product not found")
    })
    @DeleteMapping("/{cartDetailId}")
    public ResponseEntity<BaseResponse> deleteCartDetail(
            @Parameter(description = "Product ID to remove from cart", required = true)
            @PathVariable("cartDetailId") UUID cartDetailId) {
        BaseResponse response = cartService.deleteCartDetail(cartDetailId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(response);
    }

    @GetMapping("/cartDetail")
    public ResponseEntity<BaseResponse> getCartDetail(){
        BaseResponse response = cartDetailService.getCartDetail();
        return ResponseEntity.ok(response);
    }

}
