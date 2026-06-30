package com.tokyo.common.exception;

import org.springframework.http.HttpStatus;

public abstract class BaseException extends RuntimeException {

    private final HttpStatus httpStatus;

    protected BaseException(HttpStatus httpStatus, String message) {
        super(message);
        this.httpStatus = httpStatus;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}
