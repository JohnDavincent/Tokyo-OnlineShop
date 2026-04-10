package com.tokyo.onlineshop.userservices.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "addresses")
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "address")
    private String address;

    @Column(name = "postal_code")
    private String postalCode;

    @Column(name = "notes")
    private String notes;

    @Column(name = "province")
    private String province;

    @Column(name = "recipient_name")
    private String recipientName;

    @Column(name = "recipient_phone_number")
    private String recipientPhoneNumber;

    @Column(name = "city")
    private String city;

    @Column(name = "label")
    private String label;

    @Column(name = "is_default_shipping")
    private boolean isDefaultShipping;

    @ManyToOne
    @JoinColumn(name = "user_entities_id")
    private UserEntity user;
}
