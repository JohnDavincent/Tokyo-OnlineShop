package com.tokyo.onlineshop.userservices.controller;

import com.tokyo.onlineshop.userservices.dto.CreateAddressDto;
import com.tokyo.onlineshop.userservices.dto.CreateAddressRequest;
import com.tokyo.onlineshop.userservices.dto.GetUserAddressDto;
import com.tokyo.onlineshop.userservices.dto.UserDataResponse;
import com.tokyo.onlineshop.userservices.service.AddressService;
import com.tokyo.onlineshop.userservices.service.UserEntityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("tokyogo/user")
@RequiredArgsConstructor
@Tag(name = "User", description = "Authenticated user profile and address management")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {

    private final UserEntityService userEntityService;
    private final AddressService addressService;

    @Operation(
            summary = "Get user profile",
            description = "### Section: User\n" +
                    "**Request:** Retrieve the authenticated user's full profile data.\n" +
                    "**Response:** Returns UserDataResponse containing user details."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User profile retrieved successfully",
                    content = @Content(schema = @Schema(implementation = UserDataResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token missing or invalid"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/profile")
    public ResponseEntity<UserDataResponse> getUserProfile() {
        UserDataResponse response = userEntityService.getUserProfile();
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Add address",
            description = "### Section: User\n" +
                    "**Request:** Add a new delivery address for the authenticated user.\n" +
                    "**Response:** Returns CreateAddressDto containing the created address details with HTTP 201 CREATED."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Address added successfully",
                    content = @Content(schema = @Schema(implementation = CreateAddressDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid address request"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token missing or invalid")
    })
    @PostMapping("/address")
    public ResponseEntity<CreateAddressDto> addAddress(@RequestBody CreateAddressRequest request) {
        CreateAddressDto response = addressService.addAddress(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/address/list")
    public List<GetUserAddressDto> getUserAddressList(){
        return addressService.getUserAddressList();
    }

}
