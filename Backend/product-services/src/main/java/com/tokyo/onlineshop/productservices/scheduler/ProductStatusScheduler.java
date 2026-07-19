package com.tokyo.onlineshop.productservices.scheduler;

import com.tokyo.common.ProductionStatus;
import com.tokyo.onlineshop.productservices.entity.Product;
import com.tokyo.onlineshop.productservices.entity.ProductFlashSale;
import com.tokyo.onlineshop.productservices.enums.FlashSaleStatus;
import com.tokyo.onlineshop.productservices.repository.ProductFlashSaleRepository;
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
    private final ProductFlashSaleRepository flashSaleRepository;

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
   public void startFlashSale() {
       LocalDateTime time = LocalDateTime.now();
       List<ProductFlashSale> listProductFlashSale = flashSaleRepository.findAllByStatusAndStartFlashSaleDateLessThanEqual(FlashSaleStatus.SCHEDULED,time);

       if(listProductFlashSale.isEmpty()) return;

       for(ProductFlashSale flashSale : listProductFlashSale){
           flashSale.setStatus(FlashSaleStatus.ACTIVE);
       }
       log.info("Activated {} schedule flash sale start at {}",listProductFlashSale.size(),time);
    }

    @Scheduled(cron = "0 0 * * * ?") // hourly
    @Transactional
    public void endFlashSale(){
        LocalDateTime time = LocalDateTime.now();
        List<ProductFlashSale> listProductFlashSale = flashSaleRepository.findAllByStatusAndEndFlashSaleDateLessThanEqual(FlashSaleStatus.ACTIVE,time);

        if(listProductFlashSale.isEmpty()) return;

        for(ProductFlashSale flashSale : listProductFlashSale){
            flashSale.setStatus(FlashSaleStatus.ENDED);
        }
        log.info("Ended {} schedule flash sale end {}",listProductFlashSale.size(),time);
    }
}
