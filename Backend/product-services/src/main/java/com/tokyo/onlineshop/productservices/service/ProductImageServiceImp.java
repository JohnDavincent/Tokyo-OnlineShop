package com.tokyo.onlineshop.productservices.service;


import com.tokyo.onlineshop.productservices.dto.CreateImageRequest;
import com.tokyo.onlineshop.productservices.dto.CreateImageResponse;
import com.tokyo.onlineshop.productservices.dto.CreateProductRequest;
import com.tokyo.onlineshop.productservices.entity.Product;
import com.tokyo.onlineshop.productservices.entity.ProductImage;
import com.tokyo.onlineshop.productservices.repository.ProductImageRepository;
import com.tokyo.onlineshop.productservices.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductImageServiceImp implements ProductImageService {

    private final ProductImageRepository productImageRepository;
    private final ProductRepository productRepository;

    @Override
    public List<CreateImageResponse> addImage(UUID productId, List<CreateImageRequest> request) {

        if(request.isEmpty() || request == null){
            throw new RuntimeException("Image url is Empty");
        }

        Product existProduct = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("No product found"));
        List<CreateImageResponse> imageList = new ArrayList<>();

        for(CreateImageRequest image : request){
            if(productImageRepository.existsByUrl(image.getUrl())){
                throw new RuntimeException("This Image already Exists");
            }

            ProductImage addImage = ProductImage.builder()
                    .product(existProduct)
                    .url(image.getUrl())
                    .altText(image.getAltText())
                    .isPrimary(false)
                    .build();

            addImage.setIsPrimary(image == request.getFirst());
            productImageRepository.save(addImage);

            CreateImageResponse response = CreateImageResponse.builder()
                    .productName(existProduct.getName())
                    .isPrimary(addImage.getIsPrimary())
                    .url(addImage.getUrl())
                    .altText(addImage.getAltText())
                    .build();

            imageList.add(response);

        }

        return imageList;

    }
}
