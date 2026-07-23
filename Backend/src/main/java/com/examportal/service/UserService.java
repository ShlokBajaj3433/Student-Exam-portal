package com.examportal.service;

import com.examportal.dto.request.UpdateProfileRequest;
import com.examportal.dto.request.UpdateUserRequest;
import com.examportal.dto.response.StudentProfileResponse;
import com.examportal.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for admin-facing user account management and
 * student self-service profile operations.
 */
public interface UserService {

    /**
     * Returns the user with the given ID, or throws ResourceNotFoundException (404).
     */
    UserResponse getUser(Long userId);

    /**
     * Returns a paginated list of all users. The response never includes passwordHash.
     */
    Page<UserResponse> getAllUsers(Pageable pageable);

    /**
     * Updates the user's name, and (if STUDENT role) department and yearOfStudy.
     * Also supports toggling the enabled flag.
     */
    UserResponse updateUser(Long userId, UpdateUserRequest request);

    /**
     * Disables the user account identified by userId.
     *
     * @param userId      the target user to disable
     * @param callerEmail the email of the admin performing the deletion (from JWT)
     */
    void deleteUser(Long userId, String callerEmail);

    /**
     * Returns the student profile for the authenticated student identified by email.
     * Throws ResourceNotFoundException (404) if no matching user or student exists.
     *
     * @param email the JWT subject (authenticated student's email)
     * @return the student's profile data
     */
    StudentProfileResponse getStudentProfile(String email);

    /**
     * Updates the authenticated student's own profile.
     * Updates user.name, student.department, and student.yearOfStudy for non-null fields.
     *
     * Since this endpoint is student-facing and the JWT subject IS the student,
     * ownership is inherently validated (callerEmail resolves the profile being updated).
     * Throws ResourceNotFoundException (404) if no matching user or student exists.
     *
     * @param email   the JWT subject (authenticated student's email)
     * @param request fields to update; null values are ignored
     * @return the updated student profile
     */
    StudentProfileResponse updateStudentProfile(String email, UpdateProfileRequest request);

    /** Returns the admin's own profile (UserResponse) by their email. */
    UserResponse getAdminProfile(String email);

    /** Updates the authenticated admin's own name. Only name is updatable. */
    UserResponse updateAdminProfile(String email, String newName);
}
