package com.examportal.exception;

/**
 * Exception thrown when a student attempts to start an exam
 * for which they already have an active IN_PROGRESS attempt.
 * Maps to 409 Conflict response.
 */
public class DuplicateAttemptException extends RuntimeException {
    public DuplicateAttemptException(String message) {
        super(message);
    }
}
