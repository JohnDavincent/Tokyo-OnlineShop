package com.tokyo.onlineshop.productservices.specification;

import com.tokyo.common.exception.BadRequestException;
import com.tokyo.common.exception.NotFoundException;
import com.tokyo.onlineshop.productservices.entity.Product;
import com.tokyo.onlineshop.productservices.entity.ProductUnit;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class ProductUnitSpecification {


    public static Specification<ProductUnit> isProductOnSale(){
        return (root, query, criteriaBuilder) -> {
            Join<ProductUnit, Product> joinProduct = root.join("product");
            return criteriaBuilder.and(
                    criteriaBuilder.isTrue(joinProduct.get("isFlashSale")),
                    criteriaBuilder.isNotNull(joinProduct.get("flashSalePrice"))
            );
        };
    }

    public static Specification<ProductUnit> hasSearch(String search){
        return((root, query, criteriaBuilder) -> {
            if(search == null){
                return criteriaBuilder.conjunction();
            }

            String text = "%" + search.toLowerCase() + "%";
            Join<ProductUnit,Product>  joinProduct = root.join("product");
            return criteriaBuilder.like(joinProduct.get("name"),text);
        });
    }

    public static Specification<ProductUnit> hasCategory(UUID categoryId){
        return ((root, query, criteriaBuilder) -> {
            if(categoryId == null){
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("product").get("category").get("id"),categoryId);
        });
    }

    public static Specification<ProductUnit> hasSubCategory(UUID subCategoryId){
        return ((root, query, criteriaBuilder) -> {
            if(subCategoryId == null){
                return criteriaBuilder.conjunction();
            }

            return criteriaBuilder.equal(root.get("product").get("parentId").get("id"),subCategoryId);

        });
    }

//    public static Specification<ProductUnit>

}
