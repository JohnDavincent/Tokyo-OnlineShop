package com.tokyo.onlineshop.userservices.repository;

import com.tokyo.onlineshop.userservices.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AddressRepository extends JpaRepository<UUID, Address> {
}
