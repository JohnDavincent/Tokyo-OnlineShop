package com.tokyo.onlineshop.userservices.service;

import com.tokyo.common.dto.BaseResponse;
import com.tokyo.common.dto.PagingResponse;
import com.tokyo.common.exception.BadRequestException;
import com.tokyo.onlineshop.userservices.DiscountType;
import com.tokyo.onlineshop.userservices.VoucherStatus;
import com.tokyo.onlineshop.userservices.dto.request.CreateVoucherRequest;
import com.tokyo.onlineshop.userservices.dto.request.UpdateVoucherRequest;
import com.tokyo.onlineshop.userservices.dto.request.VoucherListFilter;
import com.tokyo.onlineshop.userservices.dto.response.VoucherDto;
import com.tokyo.onlineshop.userservices.dto.response.VoucherListResponse;
import com.tokyo.onlineshop.userservices.entity.Voucher;
import com.tokyo.onlineshop.userservices.repository.VoucherRepository;
import com.tokyo.onlineshop.userservices.specification.VoucherSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class VoucherServiceImpl implements VoucherService{

    private final VoucherRepository voucherRepository;

    // whitelist field yang boleh dipakai buat sort (cegah PropertyReferenceException & sort injection)
    private static final Set<String> ALLOWED_SORT = Set.of("createdAt", "startAt", "endAt", "title", "usedCount");
    private static final String DEFAULT_SORT = "createdAt";

    public VoucherServiceImpl(VoucherRepository voucherRepository) {
        this.voucherRepository = voucherRepository;
    }

    @Override
    public BaseResponse createNewVoucher( CreateVoucherRequest request) {

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

    @Override
    public BaseResponse voucherList(VoucherListFilter filter) {
        // gabung semua specification. tiap spec udah null-safe (balik conjunction kalau param null),
        // jadi nggak perlu if satu-satu.
        Specification<Voucher> spec = Specification
                .where(VoucherSpecification.hasSearch(filter.getSearch()))
                .and(VoucherSpecification.hasDiscountType(filter.getDiscountType()))
                .and(VoucherSpecification.hasVoucherStatus(filter.getVoucherStatus()))
                .and(VoucherSpecification.hasVoucherType(filter.getVoucherType()))
                .and(VoucherSpecification.hasAudience(filter.getAudience()))
                .and(VoucherSpecification.hasDate(filter.getStartDate(), filter.getEndDate()));

        // sortBy divalidasi ke whitelist, biar default "created_time" yang invalid nggak bikin error
        String sortBy = ALLOWED_SORT.contains(filter.getSortBy()) ? filter.getSortBy() : DEFAULT_SORT;
        Sort sort = Sort.by(Sort.Direction.fromString(filter.getSort()), sortBy);

        // ---- pageable = false: ambil SEMUA hasil, tanpa halaman ----
        if (!filter.isPageable()) {
            List<VoucherListResponse> items = voucherRepository.findAll(spec, sort)
                    .stream()
                    .map(this::toListResponse)
                    .toList();

            PagingResponse paging = PagingResponse.builder()
                    .items(items)
                    .totalPages(1)
                    .totalItems((long) items.size())
                    .currentPage(0)
                    .pageSize(items.size())
                    .build();

            return okList(paging);
        }

        // ---- pageable = true: pakai halaman ----
        Pageable pageable = PageRequest.of(filter.getCurrentPage(), filter.getPageSize(), sort);
        Page<Voucher> page = voucherRepository.findAll(spec, pageable);

        List<VoucherListResponse> items = page.getContent()
                .stream()
                .map(this::toListResponse)
                .toList();

        PagingResponse paging = PagingResponse.builder()
                .items(items)
                .totalPages(page.getTotalPages())
                .totalItems(page.getTotalElements())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .build();

        return okList(paging);
    }

    private BaseResponse okList(PagingResponse paging) {
        return BaseResponse.builder()
                .code(HttpStatus.OK)
                .status(HttpStatus.OK.value())
                .message("Voucher list fetched successfully")
                .data(paging)
                .build();
    }

    private VoucherListResponse toListResponse(Voucher voucher) {
        return VoucherListResponse.builder()
                .voucherId(voucher.getId())
                .voucherTitle(voucher.getTitle())
                .voucherCode(voucher.getCode())
                .startDate(voucher.getStartAt())
                .endDate(voucher.getEndAt())
                .discountType(voucher.getDiscountType())
                .voucherStatus(voucher.getVoucherStatus())
                .voucherType(voucher.getVoucherType())
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
