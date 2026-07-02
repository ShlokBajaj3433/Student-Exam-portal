package com.examportal.dto.request;

import com.examportal.validator.ValidTimeRange;
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
public record UpdateExamRequest(

        @Size(max = 200, message = "Title must not exceed 200 characters")
        String title,

        String description,

        @Min(value = 1, message = "Duration must be at least 1 minute")
        @Max(value = 300, message = "Duration must not exceed 300 minutes")
        Integer durationMinutes,

        @Min(value = 1, message = "Total marks must be at least 1")
        Integer totalMarks,

        LocalDateTime startTime,

        LocalDateTime endTime

) {}
