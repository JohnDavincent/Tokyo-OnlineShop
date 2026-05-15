package com.tokyo.onlineshop.transactionservices;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication(scanBasePackages = {"com.tokyo.onlineshop.transactionservices", "com.tokyo.common"})
@EnableDiscoveryClient
@EnableFeignClients
public class TransactionServicesApplication {

    public static void main(String[] args) {
        SpringApplication.run(TransactionServicesApplication.class, args);
    }

}
