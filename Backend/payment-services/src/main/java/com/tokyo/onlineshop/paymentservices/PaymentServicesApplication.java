package com.tokyo.onlineshop.paymentservices;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = {"com.tokyo.onlineshop.paymentservices", "com.tokyo.common"})
@EnableDiscoveryClient
@EnableScheduling
public class PaymentServicesApplication {

    public static void main(String[] args) {
        SpringApplication.run(PaymentServicesApplication.class, args);
    }

}
