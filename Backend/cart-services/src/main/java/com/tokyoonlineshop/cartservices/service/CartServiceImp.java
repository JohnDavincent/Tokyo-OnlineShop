package com.tokyoonlineshop.cartservices.service;

import com.tokyo.common.dto.BaseResponse;
import com.tokyoonlineshop.cartservices.entity.Cart;
import com.tokyoonlineshop.cartservices.entity.CartStatus;
import com.tokyoonlineshop.cartservices.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartServiceImp implements CartService {

    private final CartRepository cartRepository;

    @Override
    public BaseResponse addProduct(UUID productId) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        if(userId == null){
            throw new RuntimeException("Please login first!!");
        }

        Cart cart = cartRepository.findByUserId(UUID.fromString(userId)).orElseGet(() -> {
            return Cart.builder()
                    .cartDetails(new ArrayList<>())
                    .userId(UUID.fromString(userId))
                    .status(CartStatus.ACTIVE)
                    .build();
        });






    }
}
