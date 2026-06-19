package com.examportal.dto.response;

import java.time.LocalDateTime;

/**
 * Standard error response body returned for all 4xx / 5xx responses.
 * Requirements: 16.1–16.6
 */
public record ErrorResponse(

        int status,

        String message,

        LocalDateTime timestamp

) {
    /**
     * Convenience factory using the current timestamp.
     */
    public static ErrorResponse of(int status, String message) {
        return new ErrorResponse(status, message, LocalDateTime.now());
    }
}
