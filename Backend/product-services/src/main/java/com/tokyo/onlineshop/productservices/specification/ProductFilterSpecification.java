package com.tokyo.onlineshop.productservices.specification;

import com.tokyo.onlineshop.productservices.entity.Category;
import com.tokyo.onlineshop.productservices.entity.Product;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.UUID;

public class ProductFilterSpecification {

    public static Specification<Product> hasMainCategory(UUID categoryParentId) {
        return (root, query, criteriaBuilder) -> {
            if (categoryParentId == null) {
                return criteriaBuilder.conjunction();
            }

            // Ensure distinct results when joining
            query.distinct(true);

            Join<Product, Category> categoryJoin = root.join("category", JoinType.LEFT);
            return criteriaBuilder.equal(categoryJoin.get("parentId"), categoryParentId);
        };
    }

    public static Specification<Product> hasSubCategory(UUID subCategoryId) {
        return (root, query, criteriaBuilder) -> {
            if (subCategoryId == null) {
                return criteriaBuilder.conjunction();
            }

            query.distinct(true);

            Join<Product, Category> categoryJoin = root.join("category", JoinType.LEFT);
            return criteriaBuilder.equal(categoryJoin.get("id"), subCategoryId);
        };
    }

    public static Specification<Product> hasSearch(String search) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(search)) {
                return criteriaBuilder.conjunction();
            }

            query.distinct(true);

            String pattern = "%" + search.toLowerCase() + "%";
            Join<Product, Category> categoryJoin = root.join("category", JoinType.LEFT);

            Predicate namePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("name")), pattern);

            Predicate categoryPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(categoryJoin.get("name")), pattern);

            return criteriaBuilder.or(namePredicate, categoryPredicate);
        };
    }
}
