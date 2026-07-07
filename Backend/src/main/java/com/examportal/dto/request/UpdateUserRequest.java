package com.examportal.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for an admin updating a user account.
 * All fields are optional — only non-null values will be applied.
 * Requirements: 15.1–15.4
 */
@Schema(description = "Request body for an admin updating a user account. All fields are optional.")
public record UpdateUserRequest(

        @Schema(description = "Updated display name for the user", example = "Jane Smith")
        @Size(max = 255, message = "Name must not exceed 255 characters")
        String name,

        @Schema(description = "Updated department (applies to STUDENT role only)", example = "Computer Science")
        @Size(max = 255, message = "Department must not exceed 255 characters")
        String department,

        @Schema(description = "Updated year of study (applies to STUDENT role only)", example = "2")
        Integer yearOfStudy,

        @Schema(description = "Set to false to disable the user account, true to re-enable it", example = "true")
        Boolean enabled

) {}
