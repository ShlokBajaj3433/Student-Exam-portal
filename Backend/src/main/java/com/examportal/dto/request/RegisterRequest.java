package com.examportal.dto.request;

import com.examportal.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for user registration.
 * Requirements: 1.1–1.7, 17.1–17.3
 */
@Schema(description = "Request body for registering a new user account")
public record RegisterRequest(

        @Schema(description = "Full name of the user", example = "Jane Smith", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Name must not be blank")
        String name,

        @Schema(description = "Valid email address — must be unique across the platform", example = "jane.smith@example.com", requiredMode = Schema.RequiredMode.REQUIRED)
        @Email(message = "Email must be a valid email address")
        @NotBlank(message = "Email must not be blank")
        String email,

        @Schema(description = "Password — minimum 8, maximum 64 characters", example = "SecurePass1!", minLength = 8, maxLength = 64, requiredMode = Schema.RequiredMode.REQUIRED)
        @Size(min = 8, max = 64, message = "Password must be between 8 and 64 characters")
        @NotBlank(message = "Password must not be blank")
        String password,

        @Schema(description = "User role: ADMIN or STUDENT", example = "STUDENT", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull(message = "Role must not be null")
        Role role

) {}
