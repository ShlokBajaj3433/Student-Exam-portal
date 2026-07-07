package com.examportal.dto.response;

import com.examportal.entity.Exam;
import com.examportal.enums.ExamStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

/**
 * Response DTO for exam details (admin view — includes all fields).
 * Requirements: 4.1, 4.6, 4.8, 7.1
 */
@Schema(description = "Full exam details as seen by admins, including status, creator info, and question count")
public record ExamResponse(

        @Schema(description = "Unique exam ID", example = "1")
        Long examId,

        @Schema(description = "Exam title", example = "Java Fundamentals Mid-Term")
        String title,

        @Schema(description = "Optional exam description", example = "Covers core Java concepts from chapters 1–6")
        String description,

        @Schema(description = "Duration of the exam in minutes", example = "60")
        Integer durationMinutes,

        @Schema(description = "Total marks available for the exam", example = "100")
        Integer totalMarks,

        @Schema(description = "Exam window start time (ISO-8601); null if no window is set", example = "2025-08-01T09:00:00")
        LocalDateTime startTime,

        @Schema(description = "Exam window end time (ISO-8601); null if no window is set", example = "2025-08-01T11:00:00")
        LocalDateTime endTime,

        @Schema(description = "Current lifecycle status of the exam", example = "DRAFT")
        ExamStatus status,

        @Schema(description = "ID of the admin who created this exam", example = "2")
        Long createdById,

        @Schema(description = "Name of the admin who created this exam", example = "Admin User")
        String createdByName,

        @Schema(description = "Timestamp when the exam was created (ISO-8601)", example = "2025-07-20T14:00:00")
        LocalDateTime createdAt,

        @Schema(description = "Number of questions currently assigned to this exam", example = "20")
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
