package com.tokyo.onlineshop.userservices;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

public enum Status{
    PENDING,
    VERIFIED,
    SUSPENDED,
    LOCKED
}
