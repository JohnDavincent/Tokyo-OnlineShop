package com.tokyo.onlineshop.productservices.helper;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Component
public class ImageFileHelper {

    public String createImageFileName(String slug, MultipartFile multipartFile){
        String contentType = multipartFile.getContentType();
        String extension = switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/jpg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> throw new RuntimeException("Unsupported file format");
        };

        String uniquePart = UUID.randomUUID().toString().substring(0,8);
        return slug + "-" + uniquePart + extension;
    }
}
