package com.tokyoonlineshop.cartservices.service;
import com.tokyo.common.ProductionStatus;
import com.tokyo.common.dto.BaseResponse;
import com.tokyoonlineshop.cartservices.CartStatus;
import com.tokyoonlineshop.cartservices.client.ProductClient;
import com.tokyoonlineshop.cartservices.dto.AddProductRequest;
import com.tokyoonlineshop.cartservices.dto.GetProductClientResponse;
import com.tokyoonlineshop.cartservices.dto.GetProductUnitResponse;
import com.tokyoonlineshop.cartservices.entity.Cart;
import com.tokyoonlineshop.cartservices.entity.CartDetail;
import com.tokyoonlineshop.cartservices.repository.CartDetailRepository;
import com.tokyoonlineshop.cartservices.repository.CartRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class CartServiceImp implements CartService {

    private final CartRepository cartRepository;
    private final CartDetailRepository cartDetailRepository;
    private final ProductClient productClient;

    @Override
    public BaseResponse addProduct(AddProductRequest request) {
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

        cartRepository.save(cart);

        try{
            GetProductClientResponse product = productClient.getProduct(request.getProductId());
            List<GetProductUnitResponse> unitList = productClient.getUnit(request.getUnit(),request.getProductId());

            if(unitList == null || unitList.isEmpty()){
                throw new RuntimeException("Please select the unit price");
            }

            if(product.getStatus() == ProductionStatus.OUT_OF_STOCK){
                throw new RuntimeException("Product is out of stock");
            }

            if(product.getStatus() == ProductionStatus.IS_NOT_AVAILABLE){
                throw new RuntimeException("Product is currently not available");
            }

            if(product.getStatus() == ProductionStatus.REMOVED){
                throw new RuntimeException("Product is removed");
            }

            List<CartDetail> items = new ArrayList<>();
            for(GetProductUnitResponse unitRequest : unitList){

                if(unitRequest.getStatus() == ProductionStatus.OUT_OF_STOCK){
                    throw new RuntimeException("Unit " + unitRequest.getUnit() + " is out of stock");
                }

                Optional<CartDetail> existCartDetail = cart.getCartDetails().stream()
                        .filter(p -> p.getProductId().equals(request.getProductId()))
                        .filter(p -> request.getUnit().contains(p.getProductUnitId()))
                        .findFirst();

                if(existCartDetail.isPresent()){
                    CartDetail exist = existCartDetail.get();
                    exist.setQuantity(request.getQuantity() + exist.getQuantity());
                    exist.setSubTotal(exist.getUnitPrice().multiply(BigDecimal.valueOf(exist.getQuantity())));
                    items.add(exist);
                }else{
                    BigDecimal subTotal = unitRequest.getPrice().multiply(BigDecimal.valueOf(request.getQuantity()));
                    CartDetail cartDetail = CartDetail.builder()
                            .productId(request.getProductId())
                            .productUnitId(unitRequest.getUnitId())
                            .quantity(request.getQuantity())
                            .selected(true)
                            .unitPrice(unitRequest.getPrice())
                            .cart(cart)
                            .subTotal(subTotal)
                            .build();
                    cartDetailRepository.save(cartDetail);

                    items.add(cartDetail);
                    cart.addCartDetails(cartDetail);
                }
            }
            cartRepository.save(cart);

            return BaseResponse.builder()
                    .status(HttpStatus.CREATED.value())
                    .code(HttpStatus.CREATED)
                    .data(items)
                    .message("Success add items")
                    .build();

        }catch (FeignException e){
            log.error("Failed to connect to Product Client : {}",e.getMessage());
            throw new RuntimeException("Failed to connect to Product Client");
        }

    }
}
