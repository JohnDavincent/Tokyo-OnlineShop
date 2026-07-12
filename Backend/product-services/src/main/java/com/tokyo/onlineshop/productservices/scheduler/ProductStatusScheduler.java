package com.tokyo.onlineshop.productservices.scheduler;

import com.tokyo.common.ProductionStatus;
import com.tokyo.onlineshop.productservices.entity.Product;
import com.tokyo.onlineshop.productservices.repository.ProductRepository;
import com.tokyo.onlineshop.productservices.repository.ProductUnitRepository;
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
    private final ProductUnitRepository productUnitRepository;

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

//    @Scheduled(cron = "0 0 * * * ?") // hourly
//    @Transactional
//    public void expireFlashSales() {
//        int expired = productUnitRepository.expireFlashSales(LocalDateTime.now());
//        log.info("Cleared flash sale on {} product units", expired);
//    }
}
