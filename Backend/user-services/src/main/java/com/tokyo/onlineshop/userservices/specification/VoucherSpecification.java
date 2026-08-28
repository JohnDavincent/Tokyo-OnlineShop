package com.tokyo.onlineshop.userservices.specification;


import com.tokyo.onlineshop.userservices.DiscountType;
import com.tokyo.onlineshop.userservices.VoucherAudience;
import com.tokyo.onlineshop.userservices.VoucherStatus;
import com.tokyo.onlineshop.userservices.VoucherType;
import com.tokyo.onlineshop.userservices.entity.Voucher;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;
import java.time.LocalDateTime;

public class VoucherSpecification {

    public static Specification<Voucher> hasDiscountType(DiscountType discountType){
        return (root, query, criteriaBuilder) -> {
            if(discountType == null){
                return criteriaBuilder.conjunction();
            }

            return criteriaBuilder.equal(root.get("discountType"),discountType);
        };
    }


    public static Specification<Voucher> hasVoucherStatus(VoucherStatus voucherStatus){
        return (root, query, criteriaBuilder) -> {
            if(voucherStatus == null){
                return criteriaBuilder.conjunction();
            }

            return criteriaBuilder.equal(root.get("voucherStatus"),voucherStatus);
        };
    }

    public static Specification<Voucher> hasDate(LocalDateTime startDate, LocalDateTime endDate){
        return(root, query, criteriaBuilder) -> {
            if(startDate == null && endDate == null){
                return criteriaBuilder.conjunction();
            }

            if(startDate != null && endDate == null){
                return criteriaBuilder.greaterThanOrEqualTo(root.<LocalDateTime>get("startAt"),startDate);
            }

            if (startDate == null && endDate != null) {
                return criteriaBuilder.lessThanOrEqualTo(root.<LocalDateTime>get("startAt"), endDate);
            }

            return criteriaBuilder.between(root.<LocalDateTime>get("startAt"), startDate, endDate);
        };
    }

    public static  Specification<Voucher> hasAudience(VoucherAudience audience){
        return (root, query, criteriaBuilder) -> {
            if(audience == null){
                return criteriaBuilder.conjunction();
            }

            return criteriaBuilder.equal(root.get("audience"),audience);
        };
    }

    public static Specification<Voucher> hasSearch(String search){
        return (root, query, criteriaBuilder) -> {
            if(!StringUtils.hasText(search)){
                return criteriaBuilder.conjunction();
            }

            String pattern = "%" + search.toLowerCase() + "%";
            Predicate predicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), pattern);
            Predicate predicateCode = criteriaBuilder.like(criteriaBuilder.lower(root.get("code")), pattern);
            return criteriaBuilder.or(predicateCode, predicate);
        };
    }

    public static  Specification<Voucher> hasVoucherType(VoucherType voucherType){
        return (root, query, criteriaBuilder) -> {
            if(voucherType == null){
                return criteriaBuilder.conjunction();
            }

            return criteriaBuilder.equal(root.get("voucherType"),voucherType);
        };
    }

}
