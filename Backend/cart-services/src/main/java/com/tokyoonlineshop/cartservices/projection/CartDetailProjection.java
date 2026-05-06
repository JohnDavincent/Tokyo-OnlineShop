package com.tokyoonlineshop.cartservices.projection;

import java.math.BigDecimal;
import java.util.UUID;

public interface CartDetailProjection {
    UUID getProductId();
    UUID getProductUnitId();
    int getQuantity();
    BigDecimal getPrice();
    BigDecimal getSubTotal();

}
