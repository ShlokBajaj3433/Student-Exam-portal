package com.examportal.dto.response;

import com.examportal.entity.ExamAttempt;
import com.examportal.enums.AttemptStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

/**
 * Lightweight summary of a past exam attempt, used in the student attempt
 * history listing.
 * Requirements: 13.4
 */
@Schema(description = "Lightweight summary of a past exam attempt for the student history view")
public record AttemptSummaryResponse(

        @Schema(description = "Unique attempt ID", example = "7")
        Long attemptId,

        @Schema(description = "Title of the exam", example = "Java Fundamentals Mid-Term")
        String examTitle,

        @Schema(description = "Timestamp when the attempt was started (ISO-8601)", example = "2025-08-01T09:00:00")
        LocalDateTime attemptDate,

        @Schema(description = "Score achieved. Null if the attempt is still IN_PROGRESS.", example = "75")
        Integer score,

        @Schema(description = "Current status of the attempt", example = "SUBMITTED")
        AttemptStatus status

) {
    /**
     * Converts an {@link ExamAttempt} entity to an {@code AttemptSummaryResponse}.
     */
    public static AttemptSummaryResponse from(ExamAttempt attempt) {
        return new AttemptSummaryResponse(
                attempt.getAttemptId(),
                attempt.getExam().getTitle(),
                attempt.getStartTime(),
                attempt.getScore(),
                attempt.getAttemptStatus()
        );
    }
}
