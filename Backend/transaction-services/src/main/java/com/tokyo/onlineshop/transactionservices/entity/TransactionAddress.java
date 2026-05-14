package com.tokyo.onlineshop.transactionservices.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Embeddable
@Table(name = "transaction_address")
public class TransactionAddress {
    @Column(name = "recipient_name", length = 100)
    private String recipientName;

    @Column(name = "recipient_phone")
    @Size(max = 20)
    private String recipientPhone;

    @Column(name = "address_line",length = 255)
    private String addressLine;

    @Column(name = "city")
    private String city;

    @Column(name = "province", length = 100)
    private String province;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(name = "address_label", length = 50)
    private String addressLabel;

    @Column(name = "delivery_notes", length = 50)
    private String deliveryNotes;

}
