package com.examportal.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for user login.
 * Requirements: 2.1–2.3
 */
public record LoginRequest(

        @Email(message = "Email must be a valid email address")
        @NotBlank(message = "Email must not be blank")
        String email,

        @NotBlank(message = "Password must not be blank")
        String password

) {}
