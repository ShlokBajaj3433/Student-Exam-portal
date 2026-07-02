package com.examportal.controller;

import com.examportal.dto.request.LoginRequest;
import com.examportal.dto.request.RegisterRequest;
import com.examportal.dto.response.AuthResponse;
import com.examportal.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints.
 * Handles user registration and login operations.
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth", description = "Authentication endpoints for user registration and login")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Register a new user in the system.
     *
     * @param registerRequest the registration request containing name, email, password, and role
     * @return 201 Created with AuthResponse containing JWT token, role, and expiration time
     */
    @PostMapping("/register")
    @Operation(
            summary = "Register a new user",
            description = "Creates a new user account with the provided credentials. " +
                    "If the role is STUDENT, a linked student profile is also created."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "User successfully registered",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid registration request (validation error)"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Email already in use"
            )
    })
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        AuthResponse response = authService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Authenticate a user and generate a JWT token.
     *
     * @param loginRequest the login request containing email and password
     * @return 200 OK with AuthResponse containing JWT token, role, and expiration time
     */
    @PostMapping("/login")
    @Operation(
            summary = "User login",
            description = "Authenticates a user with email and password, returning a JWT token for subsequent requests."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "User successfully authenticated",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid login request (validation error)"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Invalid credentials"
            )
    })
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }
}
