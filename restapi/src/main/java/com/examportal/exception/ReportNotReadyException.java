package com.examportal.exception;

/**
 * Exception thrown when a student attempts to download a score report
 * for an attempt that is still IN_PROGRESS.
 * Maps to 409 Conflict response.
 */
public class ReportNotReadyException extends RuntimeException {
    public ReportNotReadyException(String message) {
        super(message);
    }
}
