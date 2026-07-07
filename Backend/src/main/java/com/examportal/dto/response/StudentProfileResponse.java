package com.examportal.dto.response;

import com.examportal.entity.Student;
import com.examportal.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

/**
 * Response DTO combining student profile fields with the underlying user
 * account details. passwordHash is excluded.
 * Requirements: 8.2
 */
@Schema(description = "Student profile combining user account data and student-specific fields")
public record StudentProfileResponse(

        // User fields
        @Schema(description = "Unique user ID", example = "5")
        Long userId,

        @Schema(description = "Full name", example = "Jane Smith")
        String name,

        @Schema(description = "Email address", example = "jane.smith@example.com")
        String email,

        @Schema(description = "User role — always STUDENT for this endpoint", example = "STUDENT")
        Role role,

        @Schema(description = "Account creation timestamp (ISO-8601)", example = "2025-07-15T08:30:00")
        LocalDateTime createdAt,

        // Student fields
        @Schema(description = "Unique student ID", example = "3")
        Long studentId,

        @Schema(description = "Auto-generated student code", example = "STU-00003")
        String studentCode,

        @Schema(description = "Department or faculty of the student", example = "Computer Science")
        String department,

        @Schema(description = "Current year of study", example = "2")
        Integer yearOfStudy

) {
    /**
     * Converts a {@link Student} entity (with its associated {@link com.examportal.entity.User})
     * to a {@code StudentProfileResponse}.
     */
    public static StudentProfileResponse from(Student student) {
        return new StudentProfileResponse(
                student.getUser().getId(),
                student.getUser().getName(),
                student.getUser().getEmail(),
                student.getUser().getRole(),
                student.getUser().getCreatedAt(),
                student.getStudentId(),
                student.getStudentCode(),
                student.getDepartment(),
                student.getYearOfStudy()
        );
    }
}
