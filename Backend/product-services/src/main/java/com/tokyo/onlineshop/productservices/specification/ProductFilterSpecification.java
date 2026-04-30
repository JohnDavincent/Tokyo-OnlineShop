package com.tokyo.onlineshop.productservices.specification;

import com.tokyo.onlineshop.productservices.entity.Brand;
import com.tokyo.onlineshop.productservices.entity.Category;
import com.tokyo.onlineshop.productservices.entity.Product;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class ProductFilterSpecification {

    public static Specification<Product> hasMainCategory(UUID categoryParentId){
        return ((root, query, criteriaBuilder) -> {
            if(categoryParentId == null){
                return criteriaBuilder.conjunction();
            }

            Join<Product, Category> categoryJoin = root.join("category", JoinType.LEFT);
            return criteriaBuilder.equal(categoryJoin.get("parentId"),categoryParentId);
        });
    }

    public static Specification<Product> hasSubCategory(UUID subCategoryId){
        return((root, query, criteriaBuilder) -> {
            if(subCategoryId == null){
                return criteriaBuilder.conjunction();
            }
            Join<Product,Category> categoryJoin = root.join("category",JoinType.LEFT);
            return criteriaBuilder.equal(categoryJoin.get("id"),subCategoryId);
        });
    }

    public static Specification<Product> hasSearch(String search){
        return ((root, query, criteriaBuilder) -> {
            if(search == null){
                return criteriaBuilder.conjunction();
            }
            String pattern = "%" + search.toLowerCase() + "%";
            Join<Product,Category> categoryJoin = root.join("category",JoinType.LEFT);

            return criteriaBuilder.like(criteriaBuilder.lower(root.get("name")),pattern);
        });
    }





}
