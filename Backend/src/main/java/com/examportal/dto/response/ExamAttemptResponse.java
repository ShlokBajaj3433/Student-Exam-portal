package com.examportal.dto.response;

import com.examportal.entity.ExamAttempt;
import com.examportal.entity.Question;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO returned when a student successfully starts an exam attempt.
 */
@Schema(description = "Response returned when a student starts an exam attempt, containing attempt details and the shuffled question list")
public record ExamAttemptResponse(

        @Schema(description = "Unique attempt ID — required for saving answers and submitting", example = "7")
        Long attemptId,

        @Schema(description = "Title of the exam", example = "Java Fundamentals Mid-Term")
        String examTitle,

        @Schema(description = "Duration of the exam in minutes", example = "60")
        Integer durationMinutes,

        @Schema(description = "Server-side start time of the attempt (ISO-8601)", example = "2025-08-01T09:00:00")
        LocalDateTime startTime,

        @Schema(description = "Deadline by which the exam must be submitted: startTime + durationMinutes (ISO-8601)", example = "2025-08-01T10:00:00")
        LocalDateTime deadline,

        @Schema(description = "Shuffled list of questions for this attempt — correctAnswer is never included")
        List<QuestionResponse> questions

) {
    public static ExamAttemptResponse from(ExamAttempt attempt, List<Question> questions) {
        LocalDateTime deadline = attempt.getStartTime()
                .plusMinutes(attempt.getExam().getDurationMinutes());

        List<QuestionResponse> questionResponses = questions.stream()
                .map(QuestionResponse::from)
                .toList();

        return new ExamAttemptResponse(
                attempt.getAttemptId(),
                attempt.getExam().getTitle(),
                attempt.getExam().getDurationMinutes(),
                attempt.getStartTime(),
                deadline,
                questionResponses
        );
    }
}
