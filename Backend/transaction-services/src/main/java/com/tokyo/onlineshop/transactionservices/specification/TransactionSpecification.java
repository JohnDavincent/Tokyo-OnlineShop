package com.tokyo.onlineshop.transactionservices.specification;

import com.tokyo.onlineshop.transactionservices.entity.Transaction;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public class TransactionSpecification {

    public static Specification<Transaction> hasDate(LocalDate startDate, LocalDate endDate){
        return (root, query, criteriaBuilder) -> {
            if(startDate == null && endDate == null){
                return criteriaBuilder.conjunction();
            }

            if(startDate != null && endDate == null){
                LocalDateTime start = startDate.atStartOfDay();
                LocalDateTime end = startDate.atTime(LocalTime.MAX);
                return criteriaBuilder.between(root.get("createdAt"),start,end);
            }

            if (startDate == null && endDate != null) {
                LocalDateTime end = endDate.atTime(LocalTime.MAX);
                return criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), end);
            }

            LocalDateTime start = startDate.atStartOfDay();
            LocalDateTime end = endDate.atTime(LocalTime.MAX);
            return criteriaBuilder.between(root.get("createdAt"), start, end);
        };
    }

    public static Specification<Transaction> hasUserId(UUID userId){
        return (root, query, criteriaBuilder) -> {
            if(userId == null){
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("userId"),userId);
        };
    }

}
