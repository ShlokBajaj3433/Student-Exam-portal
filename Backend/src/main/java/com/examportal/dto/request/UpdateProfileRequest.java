package com.examportal.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for a student updating their own profile.
 * All fields are optional — only non-null values will be applied.
 * Requirements: 8.1–8.3
 */
@Schema(description = "Request body for a student updating their own profile. All fields are optional.")
public record UpdateProfileRequest(

        @Schema(description = "Updated display name", example = "Jane Smith")
        @Size(max = 255, message = "Name must not exceed 255 characters")
        String name,

        @Schema(description = "Updated department / faculty", example = "Computer Science")
        @Size(max = 255, message = "Department must not exceed 255 characters")
        String department,

        @Schema(description = "Updated year of study (1–10)", example = "2")
        @Min(value = 1, message = "Year of study must be at least 1")
        @Max(value = 10, message = "Year of study must not exceed 10")
        Integer yearOfStudy

) {}
