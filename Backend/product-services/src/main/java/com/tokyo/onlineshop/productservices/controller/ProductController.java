package com.tokyo.onlineshop.productservices.controller;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.onlineshop.productservices.dto.GetProductClientResponse;
import com.tokyo.onlineshop.productservices.dto.GetProductUnitResponse;
import com.tokyo.onlineshop.productservices.dto.RequestProductListDto;
import com.tokyo.onlineshop.productservices.service.ProductService;
import com.tokyo.onlineshop.productservices.service.ProductUnitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/tokyo/gropup/product")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ProductUnitService productUnitService;


    @GetMapping()
    ResponseEntity<BaseResponse> getProductHomeList(){
        BaseResponse response = productService.getProductListFeatured();
        return ResponseEntity.ok(response);
    }

    @GetMapping("arrival")
    ResponseEntity<BaseResponse> getProductArrivalList(){
        BaseResponse response = productService.getLastArrivalProductList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/detail/{id}")
    ResponseEntity<BaseResponse> getProductDetail(@PathVariable UUID id){
        BaseResponse response = productService.getProductDetail(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/category-list/{categoryId}")
    ResponseEntity<BaseResponse> getProductByCategory(
            @RequestParam(defaultValue = "0", name = "current-pages") int currPages,
            @RequestParam(defaultValue = "10", name = "size") int size,
            @PathVariable("categoryId") UUID categoryId
    ){
        BaseResponse response = productService.getProductByCategory(categoryId,currPages,size);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/list")
    public ResponseEntity<BaseResponse> getProductList(@RequestBody RequestProductListDto requestDto){
        BaseResponse response = productService.getProductList(requestDto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public GetProductClientResponse getProduct(@PathVariable("id") UUID productId){
        return productService.getProduct(productId);
    }

    @PostMapping("/unit/{productId}")
    public List<GetProductUnitResponse> getUnit(@RequestBody List<UUID> unitId, @PathVariable("productId") UUID productId){
        return productUnitService.getUnit(unitId,productId);
    }

    @PostMapping("/list-by-ids")
    public List<GetProductClientResponse> getProductListByIds(@RequestBody List<UUID> productIds){
        return productService.getProductListByIds(productIds);
    }





}
