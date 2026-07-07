package com.examportal.dto.request;

import com.examportal.validator.ValidTimeRange;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * Request DTO for updating an existing exam. All fields are optional — only
 * non-null values will be applied. Cross-field validation (endTime > startTime)
 * is enforced both here (Bean Validation) and in the service layer.
 * Requirements: 4.6, 17.4–17.7
 */
@ValidTimeRange
@Schema(description = "Request body for updating a DRAFT exam. All fields are optional — only supplied non-null values are applied.")
public record UpdateExamRequest(

        @Schema(description = "Updated exam title — max 200 characters", example = "Java Fundamentals Final")
        @Size(max = 200, message = "Title must not exceed 200 characters")
        String title,

        @Schema(description = "Updated exam description", example = "Covers all Java concepts from chapters 1–12")
        String description,

        @Schema(description = "Updated duration in minutes (1–300)", example = "90")
        @Min(value = 1, message = "Duration must be at least 1 minute")
        @Max(value = 300, message = "Duration must not exceed 300 minutes")
        Integer durationMinutes,

        @Schema(description = "Updated total marks available", example = "120")
        @Min(value = 1, message = "Total marks must be at least 1")
        Integer totalMarks,

        @Schema(description = "Updated exam window start time (ISO-8601)", example = "2025-09-01T09:00:00")
        LocalDateTime startTime,

        @Schema(description = "Updated exam window end time (ISO-8601). Must be after startTime when both are supplied.", example = "2025-09-01T11:00:00")
        LocalDateTime endTime

) {}
