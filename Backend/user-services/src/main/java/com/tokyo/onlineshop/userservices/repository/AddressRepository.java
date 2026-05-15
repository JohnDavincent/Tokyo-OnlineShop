package com.tokyo.onlineshop.userservices.repository;

import com.tokyo.onlineshop.userservices.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface AddressRepository extends JpaRepository<Address,UUID> {

    @Query(
            """
            SELECT a.address
            FROM Address a
            WHERE a.user.id = :userId
            """
    )
    List<String> listAllUserAddress(@Param("userId") UUID userId);

    @Query(
            """
            SELECT a
            FROM Address a
            WHERE a.user.id = :userId
            """
    )
    List<Address> listAllUserAddressData(@Param("userId") UUID userId);
}

