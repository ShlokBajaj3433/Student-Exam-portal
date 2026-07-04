package com.examportal.exception;

import com.examportal.dto.response.ErrorResponse;
import com.examportal.dto.response.ValidationErrorResponse;
import com.examportal.exception.BadRequestException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.MalformedJwtException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

/**
 * Global exception handler for all REST endpoints.
 * Centralizes error response formatting and HTTP status code mapping.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Handle BadRequestException → 400 Bad Request
     * For example: admin attempting to delete their own account.
     */
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(BadRequestException ex) {
        log.debug("Bad request: {}", ex.getMessage());
        ErrorResponse response = ErrorResponse.of(
            HttpStatus.BAD_REQUEST.value(),
            ex.getMessage()
        );
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(response);
    }

    /**
     * Handle ResourceNotFoundException → 404 Not Found
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        log.debug("Resource not found: {} with id {}", ex.getResourceName(), ex.getResourceId());
        ErrorResponse response = ErrorResponse.of(
            HttpStatus.NOT_FOUND.value(),
            ex.getMessage()
        );
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(response);
    }

    /**
     * Handle ExamNotAvailableException → 409 Conflict
     */
    @ExceptionHandler(ExamNotAvailableException.class)
    public ResponseEntity<ErrorResponse> handleExamNotAvailable(ExamNotAvailableException ex) {
        log.debug("Exam not available: {}", ex.getMessage());
        ErrorResponse response = ErrorResponse.of(
            HttpStatus.CONFLICT.value(),
            ex.getMessage()
        );
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(response);
    }

    /**
     * Handle DuplicateAttemptException → 409 Conflict
     */
    @ExceptionHandler(DuplicateAttemptException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateAttempt(DuplicateAttemptException ex) {
        log.debug("Duplicate attempt detected: {}", ex.getMessage());
        ErrorResponse response = ErrorResponse.of(
            HttpStatus.CONFLICT.value(),
            ex.getMessage()
        );
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(response);
    }

    /**
     * Handle DuplicateEmailException → 409 Conflict
     */
    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateEmail(DuplicateEmailException ex) {
        log.debug("Duplicate email registration attempt: {}", ex.getEmail());
        ErrorResponse response = ErrorResponse.of(
            HttpStatus.CONFLICT.value(),
            ex.getMessage()
        );
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(response);
    }

    /**
     * Handle ReportNotReadyException → 409 Conflict
     */
    @ExceptionHandler(ReportNotReadyException.class)
    public ResponseEntity<ErrorResponse> handleReportNotReady(ReportNotReadyException ex) {
        log.debug("Report not ready: {}", ex.getMessage());
        ErrorResponse response = ErrorResponse.of(
            HttpStatus.CONFLICT.value(),
            ex.getMessage()
        );
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(response);
    }

    /**
     * Handle AccessDeniedException (Spring Security) → 403 Forbidden
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        log.debug("Access denied: {}", ex.getMessage());
        ErrorResponse response = ErrorResponse.of(
            HttpStatus.FORBIDDEN.value(),
            "Access denied"
        );
        return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(response);
    }

    /**
     * Handle UnauthorizedAccessException → 403 Forbidden
     * Custom exception for resource ownership violations.
     */
    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorizedAccess(UnauthorizedAccessException ex) {
        log.debug("Unauthorized access: {}", ex.getMessage());
        ErrorResponse response = ErrorResponse.of(
            HttpStatus.FORBIDDEN.value(),
            ex.getMessage()
        );
        return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(response);
    }

    /**
     * Handle MethodArgumentNotValidException → 400 Bad Request
     * Extracts field-level validation error messages.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex) {
        log.debug("Validation error: {}", ex.getBindingResult().getErrorCount());
        
        List<String> errors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .toList();

        ValidationErrorResponse response = ValidationErrorResponse.of(
            HttpStatus.BAD_REQUEST.value(),
            "Validation failed",
            errors
        );
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(response);
    }

    /**
     * Handle JwtException and MalformedJwtException → 401 Unauthorized
     */
    @ExceptionHandler({JwtException.class, MalformedJwtException.class})
    public ResponseEntity<ErrorResponse> handleJwtException(JwtException ex) {
        log.debug("JWT validation failed: {}", ex.getMessage());
        ErrorResponse response = ErrorResponse.of(
            HttpStatus.UNAUTHORIZED.value(),
            "Invalid or expired token"
        );
        return ResponseEntity
            .status(HttpStatus.UNAUTHORIZED)
            .body(response);
    }

    /**
     * Catch-all exception handler → 500 Internal Server Error
     * Logs full stack trace server-side without exposing implementation details.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        log.error("Unexpected error occurred", ex);
        ErrorResponse response = ErrorResponse.of(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "An unexpected error occurred. Please contact support."
        );
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(response);
    }
}
