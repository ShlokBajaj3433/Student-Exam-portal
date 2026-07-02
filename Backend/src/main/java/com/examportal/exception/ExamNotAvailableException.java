package com.examportal.exception;

/**
 * Exception thrown when an exam is not available for starting an attempt.
 * This can occur when:
 * - Exam status is not PUBLISHED
 * - Current time is outside the exam's start/end window
 * Maps to 409 Conflict response.
 */
public class ExamNotAvailableException extends RuntimeException {
    public ExamNotAvailableException(String message) {
        super(message);
    }
}
