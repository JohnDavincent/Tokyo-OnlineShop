package com.tokyoonlineshop.cartservices;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication(scanBasePackages = {"com.tokyoonlineshop.cartservices", "com.tokyo.common","com.tokyo.onlineshop.productservices"})
@EnableDiscoveryClient
@EnableFeignClients
public class CartServicesApplication {

    public static void main(String[] args) {
        SpringApplication.run(CartServicesApplication.class, args);
    }

}
