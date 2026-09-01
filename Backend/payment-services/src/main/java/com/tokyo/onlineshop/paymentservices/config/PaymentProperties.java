package com.tokyo.onlineshop.paymentservices.config;

import com.tokyo.onlineshop.paymentservices.enums.PaymentMethod;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Payment window length and the destinations the customer can pay to.
 * Channels are configuration rather than a table on purpose: they change rarely
 * and belong to the shop, not to any single order.
 */
@Data
@Component
@ConfigurationProperties(prefix = "app.payment")
public class PaymentProperties {

    /** How long the customer has to pay before the order is voided. */
    private int expiryMinutes = 30;

    /** How often the expiry sweep runs, in milliseconds. */
    private long expiryScanMs = 60_000;

    private List<Channel> channels = new ArrayList<>();

    @Data
    public static class Channel {
        /** Stable identifier the frontend sends back when picking a channel. */
        private String code;
        private PaymentMethod method;
        /** Human label, e.g. "QRIS" or "Bank BCA". */
        private String label;
        /** Account number for transfers; null for QRIS. */
        private String accountNumber;
        /** Account holder for transfers; null for QRIS. */
        private String accountName;
        /** Image served by the frontend, e.g. /images/payment/qris.png. */
        private String qrImageUrl;
        private String instruction;
        private boolean enabled = true;
    }
}
