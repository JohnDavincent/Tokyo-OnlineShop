package com.tokyo.onlineshop.userservices.repository;

import com.tokyo.onlineshop.userservices.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface VoucherRepository extends JpaRepository<Voucher, UUID> {
}
