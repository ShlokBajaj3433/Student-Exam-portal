package com.examportal.dto.response;

import com.examportal.entity.ExamAttempt;
import com.examportal.enums.AttemptStatus;

import java.time.LocalDateTime;

/**
 * Lightweight summary of a past exam attempt, used in the student attempt
 * history listing.
 * Requirements: 13.4
 */
public record AttemptSummaryResponse(

        Long attemptId,

        String examTitle,

        LocalDateTime attemptDate,

        Integer score,

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
