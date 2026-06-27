package com.tokyo.onlineshop.productservices.scheduler;

import com.tokyo.common.ProductionStatus;
import com.tokyo.onlineshop.productservices.entity.Product;
import com.tokyo.onlineshop.productservices.repository.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProductStatusScheduler {

    private final ProductRepository productRepository;

    @Scheduled(cron = "0 0 0 * * ?") // daily at midnight
    @Transactional
    public void expireNewProducts() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(7);
        List<Product> expired = productRepository.findExpiredNewProducts(ProductionStatus.NEW, cutoff);

        for (Product product : expired) {
            product.setStatus(ProductionStatus.AVAILABLE);
            product.setNewMarkedAt(null);
        }

        productRepository.saveAll(expired);
        log.info("Expired {} NEW products back to AVAILABLE", expired.size());
    }

    @Scheduled(cron = "0 0 * * * ?") // hourly
    @Transactional
    public void expireFlashSales() {
        LocalDateTime now = LocalDateTime.now();
        int expired = productRepository.expireFlashSales(
                ProductionStatus.AVAILABLE,
                ProductionStatus.FLASH_SALE,
                now);
        log.info("Expired {} FLASH_SALE products back to AVAILABLE", expired);
    }
}
