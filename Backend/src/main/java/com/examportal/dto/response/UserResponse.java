package com.examportal.dto.response;

import com.examportal.entity.User;
import com.examportal.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

/**
 * Response DTO for a user account. passwordHash is intentionally excluded.
 */
@Schema(description = "A user account. passwordHash is never included in responses.")
public record UserResponse(

        @Schema(description = "Unique user ID", example = "1")
        Long id,

        @Schema(description = "Full name of the user", example = "Jane Smith")
        String name,

        @Schema(description = "Email address (used as login username)", example = "jane.smith@example.com")
        String email,

        @Schema(description = "User role", example = "STUDENT")
        Role role,

        @Schema(description = "Account creation timestamp (ISO-8601)", example = "2025-07-15T08:30:00")
        LocalDateTime createdAt,

        @Schema(description = "Whether the account is active; disabled accounts cannot log in", example = "true")
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
