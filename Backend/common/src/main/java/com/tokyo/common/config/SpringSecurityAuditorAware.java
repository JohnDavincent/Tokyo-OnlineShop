package com.tokyo.common.config;

import org.springframework.security.core.Authentication;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public class SpringSecurityAuditorAware implements AuditorAware<String> {


    @Override
    public Optional<String> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        System.out.println(authentication);
        System.out.println(authentication != null ? authentication.getName() : null);
        System.out.println(authentication != null ? authentication.isAuthenticated() : null);
        if(authentication == null ||  !authentication.isAuthenticated()){
            return Optional.empty();
        }

        String principal = authentication.getName();
        if(principal == null  || principal.isBlank() || "anonymousUser".equals(principal)){
            return Optional.empty();
        }

        return Optional.of(principal);


    }
}
