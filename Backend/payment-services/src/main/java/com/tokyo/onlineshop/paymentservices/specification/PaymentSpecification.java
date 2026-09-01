package com.tokyo.onlineshop.paymentservices.specification;

import com.tokyo.onlineshop.paymentservices.entity.Payment;
import com.tokyo.onlineshop.paymentservices.enums.PaymentStatus;
import org.springframework.data.jpa.domain.Specification;

public class PaymentSpecification {

    public static Specification<Payment> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) {
                return cb.conjunction();
            }
            try {
                return cb.equal(root.get("status"), PaymentStatus.valueOf(status.toUpperCase()));
            } catch (IllegalArgumentException e) {
                return cb.conjunction();
            }
        };
    }

    public static Specification<Payment> searchKeyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return cb.conjunction();
            }
            String like = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("orderId")), like),
                    cb.like(cb.lower(cb.coalesce(root.get("payerName"), "")), like)
            );
        };
    }
}
