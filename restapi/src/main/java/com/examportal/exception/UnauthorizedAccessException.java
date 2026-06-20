package com.examportal.exception;

/**
 * Exception thrown when a user attempts to access a resource they don't own
 * or perform an action they are not authorized for.
 * Maps to 403 Forbidden response.
 */
public class UnauthorizedAccessException extends RuntimeException {
    public UnauthorizedAccessException(String message) {
        super(message);
    }
}
