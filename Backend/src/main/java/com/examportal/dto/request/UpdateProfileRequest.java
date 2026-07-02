package com.examportal.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for a student updating their own profile.
 * All fields are optional — only non-null values will be applied.
 * Requirements: 8.1–8.3
 */
public record UpdateProfileRequest(

        @Size(max = 255, message = "Name must not exceed 255 characters")
        String name,

        @Size(max = 255, message = "Department must not exceed 255 characters")
        String department,

        @Min(value = 1, message = "Year of study must be at least 1")
        @Max(value = 10, message = "Year of study must not exceed 10")
        Integer yearOfStudy

) {}
