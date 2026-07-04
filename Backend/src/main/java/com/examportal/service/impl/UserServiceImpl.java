package com.examportal.service.impl;

import com.examportal.dto.request.UpdateUserRequest;
import com.examportal.dto.response.UserResponse;
import com.examportal.entity.Student;
import com.examportal.entity.User;
import com.examportal.enums.Role;
import com.examportal.exception.BadRequestException;
import com.examportal.exception.ResourceNotFoundException;
import com.examportal.repository.StudentRepository;
import com.examportal.repository.UserRepository;
import com.examportal.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of {@link UserService} for admin-facing user account management.
 *
 * Requirements: 15.1–15.4, 18.6
 */
@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    public UserServiceImpl(UserRepository userRepository,
                           StudentRepository studentRepository) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
    }

    /**
     * Returns the user with the given ID.
     *
     * @throws ResourceNotFoundException if no user with that ID exists (404)
     * Requirements: 15.1
     */
    @Override
    @Transactional(readOnly = true)
    public UserResponse getUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return UserResponse.from(user);
    }

    /**
     * Returns a paginated list of all user accounts. passwordHash is never included.
     *
     * Requirements: 15.1, 18.6
     */
    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserResponse::from);
    }

    /**
     * Updates a user's name field on the User entity and, if the user has
     * STUDENT role, also updates department and yearOfStudy on the linked
     * Student profile. Also supports toggling the enabled flag.
     *
     * @throws ResourceNotFoundException if no user with that ID exists (404)
     * Requirements: 15.2
     */
    @Override
    public UserResponse updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Update name if provided
        if (request.name() != null) {
            user.setName(request.name());
        }

        // Update enabled flag if provided
        if (request.enabled() != null) {
            user.setEnabled(request.enabled());
        }

        userRepository.save(user);

        // If STUDENT: update department and yearOfStudy on the Student profile
        if (user.getRole() == Role.STUDENT) {
            studentRepository.findByUser(user).ifPresent(student -> {
                if (request.department() != null) {
                    student.setDepartment(request.department());
                }
                if (request.yearOfStudy() != null) {
                    student.setYearOfStudy(request.yearOfStudy());
                }
                studentRepository.save(student);
            });
        }

        return UserResponse.from(user);
    }

    /**
     * Soft-deletes a user by setting enabled = false.
     *
     * Guards against self-deletion: if {@code userId} matches the calling admin's own
     * account ID (resolved by email), a {@link BadRequestException} is thrown.
     *
     * @throws BadRequestException       if the admin attempts to delete their own account (400)
     * @throws ResourceNotFoundException if no user with that ID exists (404)
     * Requirements: 15.3, 15.4
     */
    @Override
    public void deleteUser(Long userId, String callerEmail) {
        User target = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Guard: prevent admin from deleting (disabling) their own account
        User caller = userRepository.findByEmail(callerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User (email=" + callerEmail + ")", -1L));

        if (caller.getId().equals(userId)) {
            throw new BadRequestException(
                    "You cannot delete your own admin account. " +
                    "Please ask another admin to perform this action.");
        }

        // Soft-delete: disable the account rather than removing the record
        target.setEnabled(false);
        userRepository.save(target);
    }
}
