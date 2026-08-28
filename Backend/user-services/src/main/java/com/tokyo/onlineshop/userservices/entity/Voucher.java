package com.tokyo.onlineshop.userservices.entity;

import com.tokyo.common.entity.BaseEntity;
import com.tokyo.onlineshop.userservices.DiscountType;
import com.tokyo.onlineshop.userservices.VoucherAudience;
import com.tokyo.onlineshop.userservices.VoucherStatus;
import com.tokyo.onlineshop.userservices.VoucherType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "voucher")
public class Voucher extends BaseEntity {

    @GeneratedValue(strategy = GenerationType.UUID)
    @Id
    private UUID id;

    @Column(name = "title")
    private String title;

    @Column(name = "code", unique = true, nullable = false)
    private String code;

    @Column(name = "description",length = 500)
    private String description;

    @Column(name = "voucher_type")
    @Enumerated(EnumType.STRING)
    private VoucherType voucherType;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type")
    private DiscountType discountType;

    @Column(name = "value",precision = 12, scale = 2)
    private BigDecimal value;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private VoucherStatus voucherStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "audience")
    private VoucherAudience audience;

    @Column(name = "start_at")
    private LocalDateTime startAt;

    @Column(name = "end_at")
    private LocalDateTime endAt;

    @Column(name = "total_quote")
    private Integer totalQuote;

    @Column(name = "used_count")
    private Integer usedCount;

    @Column(name = "usage_limit_per_user")
    @Builder.Default
    private Integer usageLimitPerUser = 1;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "criteria", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> criteria = new HashMap<>();

    @OneToMany(mappedBy = "voucher",cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<UserVoucher> voucherList =  new ArrayList<>();

}
