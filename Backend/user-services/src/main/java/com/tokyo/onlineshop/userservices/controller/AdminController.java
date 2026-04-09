package com.tokyo.onlineshop.userservices.controller;

import com.tokyo.onlineshop.userservices.Status;
import com.tokyo.onlineshop.userservices.dto.AdminLoginRequest;
import com.tokyo.onlineshop.userservices.entity.AdminAccount;
import com.tokyo.onlineshop.userservices.repository.AdminRepository;
import com.tokyo.onlineshop.userservices.service.JwtService;
import com.tokyo.onlineshop.userservices.service.Role;
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
public class AdminController {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/login")
    ResponseEntity<Map<String, String>> login(@Valid @RequestBody AdminLoginRequest request) {
        AdminAccount admin = adminRepository.findByEmail(request.getEmail()).orElseThrow(() -> new RuntimeException("USer not Found!!"));
        if(!passwordEncoder.matches(request.getPassword(),admin.getPasswordHash())){
            throw new RuntimeException("The password or email is wrong");
        }
        if(admin.getStatus() == Status.LOCKED || admin.getStatus() == Status.SUSPENDED){
            throw new RuntimeException("Error with admin account");
        }
        String token = jwtService.generateTokenAdmin(admin.getEmail(), Role.ADMIN);

        return ResponseEntity.ok(Map.of("accessToken", token));
    }


}
