package com.tokyo.onlineshop.userservices.service;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.common.exception.BadRequestException;
import com.tokyo.onlineshop.userservices.DiscountType;
import com.tokyo.onlineshop.userservices.VoucherStatus;
import com.tokyo.onlineshop.userservices.dto.request.CreateVoucherRequest;
import com.tokyo.onlineshop.userservices.dto.request.UpdateVoucherRequest;
import com.tokyo.onlineshop.userservices.dto.response.VoucherDto;
import com.tokyo.onlineshop.userservices.entity.Voucher;
import com.tokyo.onlineshop.userservices.repository.VoucherRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class VoucherServiceImpl implements VoucherService{

    private final VoucherRepository voucherRepository;

    public VoucherServiceImpl(VoucherRepository voucherRepository) {
        this.voucherRepository = voucherRepository;
    }

    @Override
    public BaseResponse createNewVoucher(CreateVoucherRequest request) {
        LocalDateTime now = LocalDateTime.now();
        if (request.endAt() != null && !request.endAt().isAfter(request.startAt())) {
            throw new BadRequestException("endAt harus setelah startAt");
        }
        VoucherStatus status = (request.startAt() == null || !request.startAt().isAfter(now)) ? VoucherStatus.ONGOING : VoucherStatus.SCHEDULED;

        Map<String,Object> criteria = new HashMap<>();
        criteria.put("minimal_spend", request.minimalSpend());
        criteria.put("minimal_quantity",request.minQuantity());
        criteria.put("maximum_discount",request.maximumDiscount());
        if(request.applicableProductId() != null){
            criteria.put("discount_product",request.applicableProductId());
        }
        if(request.applicableCategoryId() != null){
            criteria.put("discount_category",request.applicableCategoryId());
        }

        if(request.discountType().equals(DiscountType.PERCENTAGE)){
            if(request.value().compareTo(BigDecimal.valueOf(100)) > 0 || request.value().compareTo(BigDecimal.ZERO) < 0){
                throw new BadRequestException("Angka persentase harus diantara 0 - 100");
            }
        }

        Voucher voucher = Voucher.builder()
                .title(request.title())
                .description(request.description())
                .startAt(request.startAt())
                .endAt(request.endAt())
                .totalQuote(request.totalQuote())
                .usageLimitPerUser(request.usageLimit())
                .usedCount(0)
                .value(request.value())
                .discountType(request.discountType())
                .code(request.code())
                .voucherStatus(status)
                .startAt(request.startAt())
                .endAt(request.endAt())
                .voucherType(request.voucherType())
                .audience(request.audience())
                .criteria(criteria)
                .build();

        voucherRepository.save(voucher);

        return BaseResponse.builder()
                .code(HttpStatus.CREATED)
                .message("Voucher Successfully Created")
                .status(HttpStatus.CREATED.value())
                .data(toDto(voucher))
                .build();

    }

    @Override
    public BaseResponse updateVoucher(UUID voucherId, UpdateVoucherRequest request) {
        Voucher voucher = findVoucherOrThrow(voucherId);

        // pakai nilai baru kalau dikirim, kalau null tetap pakai nilai lama
        LocalDateTime startAt = request.startAt() != null ? request.startAt() : voucher.getStartAt();
        LocalDateTime endAt   = request.endAt()   != null ? request.endAt()   : voucher.getEndAt();
        if (endAt != null && startAt != null && !endAt.isAfter(startAt)) {
            throw new BadRequestException("endAt harus setelah startAt");
        }

        // partial update: cuma set field yang dikirim (non-null)
        if (request.title() != null)        voucher.setTitle(request.title());
        if (request.description() != null)  voucher.setDescription(request.description());
        if (request.voucherType() != null)  voucher.setVoucherType(request.voucherType());
        if (request.discountType() != null) voucher.setDiscountType(request.discountType());
        if (request.value() != null)        voucher.setValue(request.value());
        if (request.audience() != null)     voucher.setAudience(request.audience());
        if (request.totalQuote() != null)   voucher.setTotalQuote(request.totalQuote());
        if (request.usageLimit() != null)   voucher.setUsageLimitPerUser(request.usageLimit());
        voucher.setStartAt(startAt);
        voucher.setEndAt(endAt);

        // hitung ulang status dari waktu, kecuali udah di-CANCELLED admin
        if (voucher.getVoucherStatus() != VoucherStatus.CANCELLED) {
            voucher.setVoucherStatus(resolveStatus(startAt, endAt));
        }

        // merge criteria: cuma key yang dikirim yang diubah, sisanya tetap
        Map<String, Object> criteria = voucher.getCriteria() != null ? voucher.getCriteria() : new HashMap<>();
        if (request.minimalSpend() != null)         criteria.put("minimal_spend", request.minimalSpend());
        if (request.minQuantity() != null)          criteria.put("minimal_quantity", request.minQuantity());
        if (request.maximumDiscount() != null)      criteria.put("maximum_discount", request.maximumDiscount());
        if (request.applicableProductId() != null)  criteria.put("discount_product", request.applicableProductId());
        if (request.applicableCategoryId() != null) criteria.put("discount_category", request.applicableCategoryId());
        voucher.setCriteria(criteria);

        voucherRepository.save(voucher);

        return BaseResponse.builder()
                .code(HttpStatus.OK)
                .status(HttpStatus.OK.value())
                .message("Voucher Successfully Updated")
                .data(toDto(voucher))
                .build();
    }

    private Voucher findVoucherOrThrow(UUID voucherId){
        return voucherRepository.findById(voucherId)
                .orElseThrow(() -> new BadRequestException("No voucher found for id : %s".formatted(voucherId)));

    }

    private VoucherStatus resolveStatus(LocalDateTime startAt, LocalDateTime endAt) {
        LocalDateTime now = LocalDateTime.now();
        if (startAt != null && startAt.isAfter(now)) return VoucherStatus.SCHEDULED;
        if (endAt != null && endAt.isBefore(now))    return VoucherStatus.ENDED;
        return VoucherStatus.ONGOING;
    }


    private VoucherDto toDto (Voucher voucher){
        return VoucherDto.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .title(voucher.getTitle())
                .description(voucher.getDescription())
                .voucherType(voucher.getVoucherType())
                .discountType(voucher.getDiscountType())
                .value(voucher.getValue())
                .audience(voucher.getAudience())
                .voucherStatus(voucher.getVoucherStatus())
                .startAt(voucher.getStartAt())
                .endAt(voucher.getEndAt())
                .totalQuote(voucher.getTotalQuote())
                .usedCount(voucher.getUsedCount())
                .usageLimit(voucher.getUsageLimitPerUser())
                .criteria(voucher.getCriteria())
                .createdAt(voucher.getCreatedAt())
                .updatedAt(voucher.getUpdatedAt())
                .build();
    }

}
