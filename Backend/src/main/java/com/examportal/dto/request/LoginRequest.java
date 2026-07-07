package com.examportal.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for user login.
 * Requirements: 2.1–2.3
 */
@Schema(description = "Request body for authenticating an existing user")
public record LoginRequest(

        @Schema(description = "Registered email address", example = "jane.smith@example.com", requiredMode = Schema.RequiredMode.REQUIRED)
        @Email(message = "Email must be a valid email address")
        @NotBlank(message = "Email must not be blank")
        String email,

        @Schema(description = "Account password", example = "SecurePass1!", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Password must not be blank")
        String password

) {}
