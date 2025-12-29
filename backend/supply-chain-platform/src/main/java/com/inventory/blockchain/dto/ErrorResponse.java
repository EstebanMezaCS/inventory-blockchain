package com.inventory.blockchain.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.OffsetDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        String timestamp,
        int status,
        String error,
        String message,
        String path,
        List<String> details
) {

    public ErrorResponse(int status, String error, String message, String path) {
        this(OffsetDateTime.now().toString(), status, error, message, path, null);
    }

    public ErrorResponse(int status, String error, String message, String path, List<String> details) {
        this(OffsetDateTime.now().toString(), status, error, message, path, details);
    }
}
