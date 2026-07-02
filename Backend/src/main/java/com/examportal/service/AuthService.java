package com.examportal.service;

import com.examportal.dto.request.LoginRequest;
import com.examportal.dto.request.RegisterRequest;
import com.examportal.dto.response.AuthResponse;

/**
 * Interface for authentication and registration services.
 * Defines the contract for user registration and login operations.
 */
public interface AuthService {

    /**
     * Registers a new user in the system.
     * 
     * @param registerRequest the registration request
     * @return AuthResponse containing JWT token
     */
    AuthResponse register(RegisterRequest registerRequest);

    /**
     * Authenticates a user and generates a JWT token.
     * 
     * @param loginRequest the login request
     * @return AuthResponse containing JWT token
     */
    AuthResponse login(LoginRequest loginRequest);
}
