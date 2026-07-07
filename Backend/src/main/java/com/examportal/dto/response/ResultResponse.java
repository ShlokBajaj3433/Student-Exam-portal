package com.examportal.dto.response;

import com.examportal.entity.Result;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO for an evaluated exam result.
 * Requirements: 13.1, 11.5–11.8
 */
@Schema(description = "The evaluated result of a submitted exam attempt")
public record ResultResponse(

        @Schema(description = "Unique result ID", example = "3")
        Long resultId,

        @Schema(description = "ID of the exam attempt this result belongs to", example = "7")
        Long attemptId,

        @Schema(description = "Total marks scored (sum of marks for correct answers)", example = "75")
        Integer score,

        @Schema(description = "Total marks available for the exam", example = "100")
        Integer totalMarks,

        @Schema(description = "Score as a percentage, rounded to 2 decimal places", example = "75.00")
        BigDecimal percentage,

        @Schema(description = "Letter grade: A+, A, B, C, D, or F", example = "B")
        String grade,

        @Schema(description = "true if the student passed (percentage >= 40%)", example = "true")
        Boolean passed,

        @Schema(description = "Timestamp when the result was evaluated (ISO-8601)", example = "2025-08-01T10:45:00")
        LocalDateTime evaluatedAt

) {
   
    public static ResultResponse from(Result result) {
        return new ResultResponse(
                result.getResultId(),
                result.getAttempt().getAttemptId(),
                result.getScore(),
                result.getAttempt().getExam().getTotalMarks(),
                result.getPercentage(),
                result.getGrade(),
                result.getPassed(),
                result.getEvaluatedAt()
        );
    }
}
