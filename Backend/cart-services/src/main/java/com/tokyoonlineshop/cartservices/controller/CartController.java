package com.tokyoonlineshop.cartservices.controller;

import com.tokyo.common.dto.BaseResponse;
import com.tokyoonlineshop.cartservices.dto.AddProductRequest;
import com.tokyoonlineshop.cartservices.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RequestMapping("/tokyo/gropup/cart")
@RestController
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping()
    public ResponseEntity<BaseResponse> addItems(@RequestBody AddProductRequest request){
        BaseResponse response = cartService.addProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/list")
    public ResponseEntity<BaseResponse> getCartList(){
        BaseResponse response = cartService.getCartList();
        return ResponseEntity.ok(response);
    }


}
