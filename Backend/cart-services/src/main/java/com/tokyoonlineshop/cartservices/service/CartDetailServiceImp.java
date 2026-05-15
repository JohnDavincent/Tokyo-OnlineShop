package com.tokyoonlineshop.cartservices.service;

import com.tokyo.common.dto.BaseResponse;
import com.tokyoonlineshop.cartservices.client.ProductClient;
import com.tokyoonlineshop.cartservices.dto.CartDetailDto;
import com.tokyoonlineshop.cartservices.dto.GetProductClientResponse;
import com.tokyoonlineshop.cartservices.dto.GetProductUnitResponse;
import com.tokyoonlineshop.cartservices.entity.Cart;
import com.tokyoonlineshop.cartservices.entity.CartDetail;
import com.tokyoonlineshop.cartservices.repository.CartDetailRepository;
import com.tokyoonlineshop.cartservices.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartDetailServiceImp implements CartDetailService{

    private final CartDetailRepository cartDetailRepository;
    private final CartRepository cartRepository;
    private final ProductClient productClient;

    @Override
    public List<CartDetailDto> getCartDetail() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        Cart cart = cartRepository.findByUserId(UUID.fromString(userId)).orElseThrow(() -> new RuntimeException("Cart for user " + userId + "not found"));
        List<CartDetail> cartDetailList = cartDetailRepository.findByCart_Id(cart.getId());

        if(cartDetailList == null || cartDetailList.isEmpty()){
            return List.of();
        }

        List<UUID> productIds = cartDetailList.stream()
                .map(CartDetail::getProductId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        Map<UUID, GetProductClientResponse> productsById = productClient.getProductListByIds(productIds).stream()
                .filter(Objects::nonNull)
                .filter(product -> product.getProductId() != null)
                .collect(Collectors.toMap(GetProductClientResponse::getProductId, product -> product));

        Map<UUID, List<UUID>> unitIdsByProductId = cartDetailList.stream()
                .filter(cartDetail -> cartDetail.getProductId() != null)
                .filter(cartDetail -> cartDetail.getProductUnitId() != null)
                .collect(Collectors.groupingBy(
                        CartDetail::getProductId,
                        Collectors.mapping(CartDetail::getProductUnitId, Collectors.toList())
                ));

        Map<UUID, GetProductUnitResponse> unitsById = unitIdsByProductId.entrySet().stream()
                .flatMap(entry -> productClient.getUnit(entry.getValue(), entry.getKey()).stream())
                .filter(Objects::nonNull)
                .filter(unit -> unit.getUnitId() != null)
                .collect(Collectors.toMap(
                        GetProductUnitResponse::getUnitId,
                        unit -> unit,
                        (existing, replacement) -> existing
                ));

        List<CartDetailDto> cartDetailDto = cartDetailList.stream()
                .map(cartDetail -> CartDetailDto.builder()
                        .cartDetailId(cartDetail.getId())
                        .productId(cartDetail.getProductId())
                        .productUnitId(cartDetail.getProductUnitId())
                        .productName(productsById.get(cartDetail.getProductId()) != null
                                ? productsById.get(cartDetail.getProductId()).getProductName()
                                : null)
                        .productUnit(unitsById.get(cartDetail.getProductUnitId()) != null
                                ? unitsById.get(cartDetail.getProductUnitId()).getUnit()
                                : null)
                        .price(cartDetail.getUnitPrice())
                        .subTotal(cartDetail.getSubTotal())
                        .quantity(cartDetail.getQuantity())
                        .build())
                .toList();

        return cartDetailDto;
    }
}

