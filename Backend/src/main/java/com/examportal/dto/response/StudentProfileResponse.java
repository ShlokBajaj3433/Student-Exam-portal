package com.examportal.dto.response;

import com.examportal.entity.Student;
import com.examportal.enums.Role;

import java.time.LocalDateTime;

/**
 * Response DTO combining student profile fields with the underlying user
 * account details. passwordHash is excluded.
 * Requirements: 8.2
 */
public record StudentProfileResponse(

        // User fields
        Long userId,
        String name,
        String email,
        Role role,
        LocalDateTime createdAt,

        // Student fields
        Long studentId,
        String studentCode,
        String department,
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
