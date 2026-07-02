package com.examportal.dto.response;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Error response body returned for 400 Bad Request responses caused by Bean
 * Validation failures. Extends the standard error structure with a list of
 * field-level error messages.
 * Requirements: 16.3
 */
public record ValidationErrorResponse(

        int status,

        String message,

        List<String> errors,

        LocalDateTime timestamp

) {
    /**
     * Convenience factory using the current timestamp.
     */
    public static ValidationErrorResponse of(int status, String message, List<String> errors) {
        return new ValidationErrorResponse(status, message, errors, LocalDateTime.now());
    }
}
