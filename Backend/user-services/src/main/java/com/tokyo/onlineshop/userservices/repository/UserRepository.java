package com.tokyo.onlineshop.userservices.repository;

import com.tokyo.onlineshop.userservices.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserRepository extends JpaRepository<UUID, UserEntity> {
}
