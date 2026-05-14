package com.tokyo.onlineshop.transactionservices.repository;
import com.tokyo.onlineshop.transactionservices.entity.TransactionAddress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TransactionAddressRepository extends JpaRepository<TransactionAddress, UUID> {
}
