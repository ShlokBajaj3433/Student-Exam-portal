package com.examportal.dto.request;

import com.examportal.validator.ValidTimeRange;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * Request DTO for creating a new exam.
 * totalMarks is NOT accepted here — it is computed automatically
 * from the sum of assigned question marks.
 */
@ValidTimeRange
@Schema(description = "Request body for creating a new exam (starts in DRAFT status)")
public record CreateExamRequest(

        @Schema(description = "Exam title — max 200 characters", example = "Java Fundamentals Mid-Term",
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Title must not be blank")
        @Size(max = 200, message = "Title must not exceed 200 characters")
        String title,

        @Schema(description = "Optional exam description", example = "Covers core Java concepts from chapters 1–6")
        String description,

        @Schema(description = "Duration of the exam in minutes (1–300)", example = "60",
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull(message = "Duration in minutes must not be null")
        @Min(value = 1, message = "Duration must be at least 1 minute")
        @Max(value = 300, message = "Duration must not exceed 300 minutes")
        Integer durationMinutes,

        @Schema(description = "Optional exam window start time (ISO-8601)", example = "2025-08-01T09:00:00")
        LocalDateTime startTime,

        @Schema(description = "Optional exam window end time (ISO-8601). Must be after startTime.",
                example = "2025-08-01T11:00:00")
        LocalDateTime endTime

) {}
