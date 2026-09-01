package com.tokyo.onlineshop.paymentservices.scheduler;

import com.tokyo.onlineshop.paymentservices.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Closes payment windows the customer never confirmed. The countdown the
 * customer sees is only a display; this sweep is what actually voids the order.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentExpiryScheduler {

    private final PaymentService paymentService;

    @Scheduled(
            fixedDelayString = "${app.payment.expiry-scan-ms:60000}",
            initialDelayString = "${app.payment.expiry-scan-ms:60000}"
    )
    public void expireOverduePayments() {
        int expired = paymentService.expireOverduePayments();
        if (expired > 0) {
            log.info("[Scheduler] expired {} payment(s)", expired);
        }
    }
}
