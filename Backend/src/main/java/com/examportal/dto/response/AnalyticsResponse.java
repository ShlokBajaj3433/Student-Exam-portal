package com.examportal.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Response DTO for the admin analytics dashboard.
 *
 * Contains platform-wide aggregated stats plus a per-exam breakdown.
 */
public record AnalyticsResponse(

        /** Total number of exam attempts across all exams. */
        long totalAttempts,

        /** Platform-wide pass rate as a percentage (0–100), rounded to 2 decimal places. */
        BigDecimal passRate,

        /** Platform-wide average score as a percentage (0–100), rounded to 2 decimal places. */
        BigDecimal averageScore,

        /** Per-exam statistics. */
        List<ExamStat> examStats

) {

    /**
     * Per-exam analytics breakdown.
     *
     * @param examId              the exam's primary key
     * @param examTitle           the exam title
     * @param totalAttempts       number of completed/timed-out attempts for this exam
     * @param passRate            percentage of attempts that passed, rounded to 2 dp
     * @param averageScore        average percentage score across all attempts, rounded to 2 dp
     * @param difficultyBreakdown map from difficulty label (EASY/MEDIUM/HARD/UNKNOWN) to
     *                            number of questions at that difficulty level in this exam
     */
    public record ExamStat(
            Long examId,
            String examTitle,
            long totalAttempts,
            BigDecimal passRate,
            BigDecimal averageScore,
            Map<String, Long> difficultyBreakdown
    ) {}
}
