package com.tokyo.onlineshop.transactionservices.repository;
import com.tokyo.onlineshop.transactionservices.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    @Query(
            """
            SELECT t.dailyTransactionNumber
            FROM Transaction t
            ORDER BY t.createdAt DESC
            LIMIT 1
            """
    )
    Integer findLastDailyTransaction();
}
