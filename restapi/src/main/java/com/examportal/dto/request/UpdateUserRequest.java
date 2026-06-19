package com.examportal.dto.request;

import jakarta.validation.constraints.Size;

/**
 * Request DTO for an admin updating a user account.
 * All fields are optional — only non-null values will be applied.
 * Requirements: 15.1–15.4
 */
public record UpdateUserRequest(

        @Size(max = 255, message = "Name must not exceed 255 characters")
        String name,

        @Size(max = 255, message = "Department must not exceed 255 characters")
        String department,

        Integer yearOfStudy,

        Boolean enabled

) {}
