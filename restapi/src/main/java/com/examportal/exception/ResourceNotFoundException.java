package com.examportal.exception;

/**
 * Exception thrown when a requested resource is not found.
 * Maps to 404 Not Found response.
 */
public class ResourceNotFoundException extends RuntimeException {
    private final String resourceName;
    private final Long resourceId;

    public ResourceNotFoundException(String resourceName, Long id) {
        super(String.format("%s with id %d not found", resourceName, id));
        this.resourceName = resourceName;
        this.resourceId = id;
    }

    public String getResourceName() {
        return resourceName;
    }

    public Long getResourceId() {
        return resourceId;
    }
}
