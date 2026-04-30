package com.tokyo.onlineshop.productservices.controller;

import com.tokyo.onlineshop.productservices.service.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/tokyo/gropup/")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;

}
