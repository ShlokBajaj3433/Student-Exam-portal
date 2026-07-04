package com.examportal.service;

import com.examportal.dto.request.UpdateUserRequest;
import com.examportal.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for admin-facing user account management.
 *
 * Requirements: 15.1–15.4, 18.6
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
     * Throws BadRequestException if userId matches the calling admin's own ID.
     *
     * @param userId      the target user to disable
     * @param callerEmail the email of the admin performing the deletion (from JWT)
     */
    void deleteUser(Long userId, String callerEmail);
}
