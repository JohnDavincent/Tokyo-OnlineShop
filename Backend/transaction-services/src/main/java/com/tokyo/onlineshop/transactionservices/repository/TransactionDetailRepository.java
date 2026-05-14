package com.tokyo.onlineshop.transactionservices.repository;

import com.tokyo.onlineshop.transactionservices.entity.TransactionDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TransactionDetailRepository extends JpaRepository<TransactionDetail, UUID> {
}
