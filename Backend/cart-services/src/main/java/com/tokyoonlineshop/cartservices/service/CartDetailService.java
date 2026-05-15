package com.tokyoonlineshop.cartservices.service;


import com.tokyo.common.dto.BaseResponse;
import com.tokyoonlineshop.cartservices.dto.CartDetailDto;

import java.util.List;

public interface CartDetailService {
    public List<CartDetailDto> getCartDetail();
}
