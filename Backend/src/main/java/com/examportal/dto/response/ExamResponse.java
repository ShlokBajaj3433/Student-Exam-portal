package com.examportal.dto.response;

import com.examportal.entity.Exam;
import com.examportal.enums.ExamStatus;

import java.time.LocalDateTime;

/**
 * Response DTO for exam details (admin view — includes all fields).
 * Requirements: 4.1, 4.6, 4.8, 7.1
 */
public record ExamResponse(

        Long examId,

        String title,

        String description,

        Integer durationMinutes,

        Integer totalMarks,

        LocalDateTime startTime,

        LocalDateTime endTime,

        ExamStatus status,

        Long createdById,

        String createdByName,

        LocalDateTime createdAt,

        int questionCount

) {
    /**
     * Converts an {@link Exam} entity to an {@code ExamResponse}.
     */
    public static ExamResponse from(Exam exam) {
        return new ExamResponse(
                exam.getExamId(),
                exam.getTitle(),
                exam.getDescription(),
                exam.getDurationMinutes(),
                exam.getTotalMarks(),
                exam.getStartTime(),
                exam.getEndTime(),
                exam.getStatus(),
                exam.getCreatedBy() != null ? exam.getCreatedBy().getId() : null,
                exam.getCreatedBy() != null ? exam.getCreatedBy().getName() : null,
                exam.getCreatedAt(),
                exam.getQuestions() != null ? exam.getQuestions().size() : 0
        );
    }
}
