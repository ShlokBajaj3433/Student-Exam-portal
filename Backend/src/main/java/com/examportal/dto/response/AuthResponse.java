package com.examportal.dto.response;

import com.examportal.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Response DTO returned after successful registration or login.
 * Requirements: 2.1, 2.4, 2.5
 */
@Schema(description = "Response body returned on successful registration or login")
public record AuthResponse(

        @Schema(description = "Signed JWT token — include as 'Authorization: Bearer <token>' on subsequent requests", example = "eyJhbGciOiJIUzI1NiJ9...")
        String token,

        @Schema(description = "Role of the authenticated user", example = "STUDENT")
        Role role,

        @Schema(description = "Token lifetime in milliseconds from issuance", example = "86400000")
        long expiresIn

) {}
