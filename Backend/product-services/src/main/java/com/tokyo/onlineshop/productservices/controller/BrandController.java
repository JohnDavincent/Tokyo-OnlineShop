package com.tokyo.onlineshop.productservices.controller;

import com.tokyo.common.dto.WebResponse;
import com.tokyo.onlineshop.productservices.dto.CreateBrandRequest;
import com.tokyo.onlineshop.productservices.dto.CreateBrandResponse;
import com.tokyo.onlineshop.productservices.service.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/tokyo/gropup/")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;

}
