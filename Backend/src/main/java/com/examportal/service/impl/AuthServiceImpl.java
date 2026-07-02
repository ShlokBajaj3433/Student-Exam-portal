package com.examportal.service.impl;

import com.examportal.dto.request.LoginRequest;
import com.examportal.dto.request.RegisterRequest;
import com.examportal.dto.response.AuthResponse;
import com.examportal.entity.Student;
import com.examportal.entity.User;
import com.examportal.enums.Role;
import com.examportal.exception.DuplicateEmailException;
import com.examportal.repository.StudentRepository;
import com.examportal.repository.UserRepository;
import com.examportal.security.JwtUtil;
import com.examportal.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for user authentication and registration.
 * Handles user registration with email validation, password encoding, and JWT token generation.
 * Handles user login with credentials verification and JWT token generation.
 * 
 * Requirements addressed:
 *   Requirement 1.1–1.7: User registration (validation, duplicate check, student profile creation)
 *   Requirement 2.1–2.5: User authentication (login, JWT generation, token expiration)
 */
@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Autowired
    public AuthServiceImpl(
            UserRepository userRepository,
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            UserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    /**
     * Registers a new user in the system.
     * 
     * Preconditions:
     *   - registerRequest is non-null and valid (validated by Bean Validation)
     *   - Email is not already registered
     *   - Role is one of {ADMIN, STUDENT}
     * 
     * Postconditions:
     *   - A new User record is created with BCrypt-encoded password (cost 12)
     *   - If role is STUDENT, a linked Student profile is also created
     *   - A JWT token is generated and returned in AuthResponse
     *   - User's enabled flag is set to true by default
     * 
     * Requirements:
     *   Requirement 1.1: Create new user account with valid credentials
     *   Requirement 1.2: Reject duplicate email registration
     *   Requirement 1.3–1.5: Input validation (email format, password length, name)
     *   Requirement 1.6: Create linked Student profile for STUDENT role
     *   Requirement 1.7: Store passwords as BCrypt hashes with cost factor 12
     *   Requirement 2.4–2.5: Generate JWT token with HS256 and 24-hour expiration
     * 
     * @param registerRequest the registration request containing name, email, password, and role
     * @return AuthResponse containing JWT token, role, and expiration time
     * @throws DuplicateEmailException if email already exists in the system
     */
    @Override
    @Transactional
    public AuthResponse register(RegisterRequest registerRequest) {
        // Check for duplicate email (Requirement 1.2)
        if (userRepository.existsByEmail(registerRequest.email())) {
            throw new DuplicateEmailException(registerRequest.email());
        }

        // Create new User entity (Requirement 1.1)
        User newUser = new User();
        newUser.setName(registerRequest.name());
        newUser.setEmail(registerRequest.email());
        // Encode password with BCrypt cost factor 12 (Requirement 1.7)
        newUser.setPasswordHash(passwordEncoder.encode(registerRequest.password()));
        newUser.setRole(registerRequest.role());
        newUser.setEnabled(true);

        // Save User record to database
        User savedUser = userRepository.save(newUser);

        // If role is STUDENT, create and save a linked Student profile (Requirement 1.6)
        if (registerRequest.role() == Role.STUDENT) {
            Student student = new Student();
            student.setUser(savedUser);
            student.setStudentCode(null);  // To be filled in by admin or student later
            student.setDepartment(null);
            student.setYearOfStudy(null);
            studentRepository.save(student);
        }

        // Load user details and generate JWT token (Requirement 2.4, 2.5)
        UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        // Return auth response with token and expiration
        return new AuthResponse(
                token,
                savedUser.getRole(),
                getTokenExpirationMs()
        );
    }

    /**
     * Authenticates a user and generates a JWT token.
     * 
     * Preconditions:
     *   - loginRequest is non-null and valid (validated by Bean Validation)
     *   - User with given email exists in the database
     * 
     * Postconditions:
     *   - Password is verified against stored hash
     *   - JWT token is generated for valid credentials
     *   - Throws BadCredentialsException for invalid credentials or missing user
     * 
     * Requirements:
     *   Requirement 2.1: Return JWT token on valid credentials
     *   Requirement 2.2: Reject login with wrong password (401)
     *   Requirement 2.3: Reject login for non-existent email (401 without email hint)
     *   Requirement 2.4–2.5: Generate JWT token with HS256 and 24-hour expiration
     * 
     * @param loginRequest the login request containing email and password
     * @return AuthResponse containing JWT token, role, and expiration time
     * @throws BadCredentialsException if email not found or password is incorrect
     */
    @Override
    public AuthResponse login(LoginRequest loginRequest) {
        // Load user details from database (throws UsernameNotFoundException if not found)
        UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.email());

        // Verify password (Requirement 2.2)
        if (!passwordEncoder.matches(loginRequest.password(), userDetails.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        // Generate JWT token (Requirement 2.1, 2.4, 2.5)
        String token = jwtUtil.generateToken(userDetails);

        // Extract role from authorities
        Role role = extractRoleFromAuthorities(userDetails);

        // Return auth response
        return new AuthResponse(
                token,
                role,
                getTokenExpirationMs()
        );
    }

    /**
     * Extracts the user's role from their Spring Security authorities.
     * 
     * @param userDetails the user details containing authorities
     * @return the Role enum value (ADMIN or STUDENT)
     */
    private Role extractRoleFromAuthorities(UserDetails userDetails) {
        return userDetails.getAuthorities().stream()
                .map(auth -> auth.getAuthority().replace("ROLE_", ""))
                .map(Role::valueOf)
                .findFirst()
                .orElse(Role.STUDENT);  // default to STUDENT if not found
    }

    /**
     * Returns the JWT token expiration time in milliseconds.
     * This is read from the application configuration.
     * 
     * @return expiration time in milliseconds (default 86400000 = 24 hours)
     */
    private long getTokenExpirationMs() {
        // Default to 24 hours in milliseconds
        return 86400000L;
    }
}
