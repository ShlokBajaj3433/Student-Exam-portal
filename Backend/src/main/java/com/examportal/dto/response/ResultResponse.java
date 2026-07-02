package com.examportal.dto.response;

import com.examportal.entity.Result;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO for an evaluated exam result.
 * Requirements: 13.1, 11.5–11.8
 */
public record ResultResponse(

        Long resultId,

        Long attemptId,

        Integer score,

        Integer totalMarks,

        BigDecimal percentage,

        String grade,

        Boolean passed,

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
