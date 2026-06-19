package com.examportal.dto.response;

import com.examportal.entity.ExamAttempt;
import com.examportal.entity.Question;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO returned when a student successfully starts an exam attempt.
 */
public record ExamAttemptResponse(

        Long attemptId,

        String examTitle,

        Integer durationMinutes,

        LocalDateTime startTime,

        /** Timer deadline: startTime + durationMinutes. Computed server-side. */
        LocalDateTime deadline,

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
