package com.tokyo.onlineshop.transactionservices.repository;
import com.tokyo.onlineshop.transactionservices.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID>, JpaSpecificationExecutor<Transaction> {
    @Query(
            """
            SELECT t.dailyTransactionNumber
            FROM Transaction t
            ORDER BY t.createdAt DESC
            LIMIT 1
            """
    )
    Integer findLastDailyTransaction();
    Optional<Transaction> findByUserIdAndOrderId(UUID userId, String orderId);
}


