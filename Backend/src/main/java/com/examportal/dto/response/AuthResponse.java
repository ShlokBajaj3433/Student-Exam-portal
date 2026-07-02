package com.examportal.dto.response;

import com.examportal.enums.Role;

/**
 * Response DTO returned after successful registration or login.
 * Requirements: 2.1, 2.4, 2.5
 */
public record AuthResponse(

        String token,

        Role role,

        long expiresIn

) {}
