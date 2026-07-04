package com.examportal.exception;

/**
 * Exception for business-rule violations that map to 400 Bad Request.
 * For example: an admin attempting to delete their own account.
 *
 * Requirements: 15.4
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
