package com.examportal.dto.request;

import com.examportal.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for user registration.
 * Requirements: 1.1–1.7, 17.1–17.3
 */
public record RegisterRequest(

        @NotBlank(message = "Name must not be blank")
        String name,

        @Email(message = "Email must be a valid email address")
        @NotBlank(message = "Email must not be blank")
        String email,

        @Size(min = 8, max = 64, message = "Password must be between 8 and 64 characters")
        @NotBlank(message = "Password must not be blank")
        String password,

        @NotNull(message = "Role must not be null")
        Role role

) {}
