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

    public static Specification<Transaction> hasStatus(String status){
        return (root, query, criteriaBuilder) -> {
            if (status == null || status.isBlank() || status.equalsIgnoreCase("ALL")) {
                return criteriaBuilder.conjunction();
            }
            try {
                com.tokyo.onlineshop.transactionservices.enums.TransactionStatus txStatus = 
                    com.tokyo.onlineshop.transactionservices.enums.TransactionStatus.valueOf(status.toUpperCase());
                return criteriaBuilder.equal(root.get("status"), txStatus);
            } catch (IllegalArgumentException e) {
                return criteriaBuilder.conjunction();
            }
        };
    }

    public static Specification<Transaction> searchKeyword(String keyword){
        return (root, query, criteriaBuilder) -> {
            if (keyword == null || keyword.isBlank()) {
                return criteriaBuilder.conjunction();
            }
            String likePattern = "%" + keyword.toLowerCase() + "%";
            return criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(root.get("orderId")), likePattern),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("deliveryAddress").get("recipientName")), likePattern),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("deliveryAddress").get("recipientPhone")), likePattern)
            );
        };
    }
}
