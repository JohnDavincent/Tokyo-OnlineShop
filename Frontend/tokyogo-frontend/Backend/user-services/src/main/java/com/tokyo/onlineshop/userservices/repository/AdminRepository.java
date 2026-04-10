package com.tokyo.onlineshop.userservices.repository;

import com.tokyo.onlineshop.userservices.entity.AdminAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AdminRepository extends JpaRepository<AdminAccount, UUID> {
    public Optional<AdminAccount> findByEmail(String email);
}
