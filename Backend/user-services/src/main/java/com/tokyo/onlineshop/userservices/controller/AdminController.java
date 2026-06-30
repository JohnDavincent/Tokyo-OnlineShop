package com.tokyo.onlineshop.userservices.controller;

import com.tokyo.common.exception.BadRequestException;
import com.tokyo.common.exception.ForbiddenException;
import com.tokyo.common.exception.NotFoundException;
import com.tokyo.onlineshop.userservices.Status;
import com.tokyo.onlineshop.userservices.dto.AdminLoginRequest;
import com.tokyo.onlineshop.userservices.entity.AdminAccount;
import com.tokyo.onlineshop.userservices.repository.AdminRepository;
import com.tokyo.onlineshop.userservices.service.JwtService;
import com.tokyo.onlineshop.userservices.service.Role;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/tokyo/group/ad-min")
@Tag(name = "Admin - Authentication", description = "Admin authentication and login operations")
public class AdminController {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Operation(
            summary = "Admin login",
            description = "### Section: Admin - Authentication\n" +
                    "**Request:** Authenticate an admin user with email and password.\n" +
                    "**Response:** Returns a JWT access token for authenticated admin sessions."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login successful - returns access token",
                    content = @Content(schema = @Schema(implementation = Map.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "401", description = "Invalid email or password"),
            @ApiResponse(responseCode = "403", description = "Admin account is locked or suspended")
    })
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@Valid @RequestBody AdminLoginRequest request) {
        AdminAccount admin = adminRepository.findByEmail(request.getEmail()).orElseThrow(() -> new NotFoundException("User not Found!!"));
        if (!passwordEncoder.matches(request.getPassword(), admin.getPasswordHash())) {
            throw new BadRequestException("The password or email is wrong");
        }
        if (admin.getStatus() == Status.LOCKED || admin.getStatus() == Status.SUSPENDED) {
            throw new ForbiddenException("Admin account is locked or suspended");
        }
        String token = jwtService.generateTokenAdmin(admin.getEmail(), Role.ADMIN);

        return ResponseEntity.ok(Map.of("accessToken", token));
    }

}
