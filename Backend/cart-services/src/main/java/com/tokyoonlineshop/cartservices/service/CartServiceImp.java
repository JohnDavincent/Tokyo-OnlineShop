package com.tokyoonlineshop.cartservices.service;
import com.tokyo.common.ProductionStatus;
import com.tokyo.common.dto.BaseResponse;
import com.tokyoonlineshop.cartservices.CartStatus;
import com.tokyoonlineshop.cartservices.client.ProductClient;
import com.tokyoonlineshop.cartservices.dto.*;
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
                throw new RuntimeException("Please select the unit");
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

            List<AddProductResponse> items = new ArrayList<>();
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
                    items.add(convertToAddProductResponse(exist,product.getProductName()));
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
                    items.add(convertToAddProductResponse(cartDetail,product.getProductName()));
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

    @Override
    public BaseResponse getCartList() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        if(userId == null){
            throw new RuntimeException("Login first!!");
        }
        Cart cart = cartRepository.findByUserId(UUID.fromString(userId)).orElseThrow(() -> new RuntimeException("add a product first"));
        List<CartDetail> cartList = cartDetailRepository.findByCartId(cart.getId());
        if(cartList == null || cartList.isEmpty()){
            return BaseResponse.builder()
                    .status(HttpStatus.OK.value())
                    .message("Cart is empty")
                    .data(null)
                    .build();
        }

        List<UUID> productIds = cartList.stream()
                .map(CartDetail::getProductId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        log.info("Cart list size: {}, productIds: {}", cartList.size(), productIds);
        Map<UUID, GetProductClientResponse> productMap = productClient.getProductListByIds(productIds).stream()
                .filter(Objects::nonNull)
                .filter(p -> p.getProductId() != null)
                .collect(Collectors.toMap(GetProductClientResponse::getProductId, p -> p));

        Map<UUID, List<UUID>> unitsByProduct = cartList.stream()
                .filter(item -> item.getProductId() != null)
                .collect(Collectors.groupingBy(
                        CartDetail::getProductId,
                        Collectors.mapping(CartDetail::getProductUnitId, Collectors.toList())
                ));

        BigDecimal grandTotal = cartList.stream()
                .map(price -> price.getSubTotal() != null ? price.getSubTotal() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CartListItemResponse> cartItems = cartList.stream()
                .map(item -> {
                    GetProductClientResponse product = productMap.get(item.getProductId());
                    if (product == null) {
                        log.warn("Product not found for id: {}", item.getProductId());
                        return null;
                    }
                    List<GetProductUnitResponse> unit = productClient.getUnit(
                            unitsByProduct.get(item.getProductId()),
                            item.getProductId()
                    );

                    return CartListItemResponse.builder()
                            .productName(product.getProductName())
                            .price(item.getUnitPrice())
                            .productUnit(
                                    unit.stream()
                                            .filter(u -> u.getUnitId().equals(item.getProductUnitId()))
                                            .findFirst()
                                            .map(GetProductUnitResponse::getUnit)
                                            .orElse(null))
                            .quantity(item.getQuantity())
                            .subTotal(item.getSubTotal())
                            .build();
                })
                .filter(Objects::nonNull)
                .toList();

        CartListResponse response = CartListResponse.builder()
                .itemList(cartItems)
                .grandTotal(grandTotal)
                .build();

        return BaseResponse.builder()
                .status(HttpStatus.OK.value())
                .message("CartList successfully loaded")
                .code(HttpStatus.CREATED)
                .data(response)
                .build();
    }

    private AddProductResponse convertToAddProductResponse(CartDetail detail, String productName){
        return AddProductResponse.builder()
                .productName(productName)
                .quantity(detail.getQuantity())
                .subTotal(detail.getSubTotal())
                .build();
    }
}
