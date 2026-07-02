package com.examportal.dto.response;

import com.examportal.entity.User;
import com.examportal.enums.Role;

import java.time.LocalDateTime;

/**
 * Response DTO for a user account. passwordHash is intentionally excluded.
 */
public record UserResponse(

        Long id,

        String name,

        String email,

        Role role,

        LocalDateTime createdAt,

        boolean enabled

) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt(),
                user.isEnabled()
        );
    }
}
