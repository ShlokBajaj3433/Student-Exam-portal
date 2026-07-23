package com.examportal.dto.request;

import com.examportal.validator.ValidTimeRange;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * Request DTO for updating an existing exam. All fields are optional.
 * totalMarks is NOT accepted — it is derived from assigned question marks.
 */
@ValidTimeRange
@Schema(description = "Request body for updating a DRAFT exam. totalMarks is computed from questions.")
public record UpdateExamRequest(

        @Schema(description = "Updated exam title — max 200 characters", example = "Java Fundamentals Final")
        @Size(max = 200, message = "Title must not exceed 200 characters")
        String title,

        @Schema(description = "Updated exam description")
        String description,

        @Schema(description = "Updated duration in minutes (1–300)", example = "90")
        @Min(value = 1, message = "Duration must be at least 1 minute")
        @Max(value = 300, message = "Duration must not exceed 300 minutes")
        Integer durationMinutes,

        @Schema(description = "Updated exam window start time (ISO-8601)", example = "2025-09-01T09:00:00")
        LocalDateTime startTime,

        @Schema(description = "Updated exam window end time (ISO-8601)", example = "2025-09-01T11:00:00")
        LocalDateTime endTime

) {}
