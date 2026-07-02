package com.examportal.exception;

/**
 * Exception thrown when attempting to register a user with an email
 * that already exists in the system.
 * Maps to 409 Conflict response.
 */
public class DuplicateEmailException extends RuntimeException {
    private final String email;

    public DuplicateEmailException(String email) {
        super(String.format("Email %s already exists", email));
        this.email = email;
    }

    public String getEmail() {
        return email;
    }
}
