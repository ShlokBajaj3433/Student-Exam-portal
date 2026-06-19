package com.examportal.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * Request DTO for creating a new exam.
 * Requirements: 4.1–4.5, 17.4–17.7
 */
public record CreateExamRequest(

        @NotBlank(message = "Title must not be blank")
        @Size(max = 200, message = "Title must not exceed 200 characters")
        String title,

        String description,

        @NotNull(message = "Duration in minutes must not be null")
        @Min(value = 1, message = "Duration must be at least 1 minute")
        @Max(value = 300, message = "Duration must not exceed 300 minutes")
        Integer durationMinutes,

        @NotNull(message = "Total marks must not be null")
        @Min(value = 1, message = "Total marks must be at least 1")
        Integer totalMarks,

        LocalDateTime startTime,

        LocalDateTime endTime

) {}
