package com.examportal.controller;

import com.examportal.dto.request.UpdateUserRequest;
import com.examportal.dto.response.AnalyticsResponse;
import com.examportal.dto.response.ResultResponse;
import com.examportal.dto.response.UserResponse;
import com.examportal.entity.Exam;
import com.examportal.repository.ExamRepository;
import com.examportal.repository.ResultRepository;
import com.examportal.service.ResultService;
import com.examportal.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST controller for admin management endpoints:
 *   - Paginated and filtered result listing
 *   - Analytics dashboard
 *   - User account management (list, get, update, delete)
 *
 * All endpoints require ADMIN role, enforced both at SecurityConfig path level
 * and via method-level @PreAuthorize for defence-in-depth.
 *
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin management: results, analytics, and user account management")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final ResultService resultService;
    private final UserService userService;
    private final ResultRepository resultRepository;
    private final ExamRepository examRepository;

    public AdminController(ResultService resultService,
                           UserService userService,
                           ResultRepository resultRepository,
                           ExamRepository examRepository) {
        this.resultService = resultService;
        this.userService = userService;
        this.resultRepository = resultRepository;
        this.examRepository = examRepository;
    }

    // ─── Results ─────────────────────────────────────────────────────────────

    /**
     * GET /api/admin/results             → all results, paginated
     * GET /api/admin/results?examId={id} → results filtered by exam, paginated
     *
     */
    @GetMapping("/results")
    @Operation(
            summary = "List all results (optionally filtered by exam)",
            description = "Returns a paginated list of all evaluated results. " +
                    "If examId is supplied, the results are filtered to that exam only."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Page of results returned",
                    content = @Content(schema = @Schema(implementation = ResultResponse.class))
            ),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Caller does not have ADMIN role")
    })
    public ResponseEntity<Page<ResultResponse>> getResults(
            @Parameter(description = "Optional exam ID to filter results")
            @RequestParam(required = false) Long examId,
            @PageableDefault(size = 20, sort = "resultId") Pageable pageable) {

        if (examId != null) {
            return ResponseEntity.ok(resultService.getResultsByExam(examId, pageable));
        }
        return ResponseEntity.ok(resultService.getAllResults(pageable));
    }

    // ─── Analytics ────────────────────────────────────────────────────────────

    /**
     * GET /api/admin/analytics → aggregated platform statistics per exam
     *
     */
    @GetMapping("/analytics")
    @Operation(
            summary = "Get analytics dashboard",
            description = "Returns platform-wide aggregated statistics: total attempts, " +
                    "pass rate, average score, and a per-exam breakdown with difficulty distribution."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Analytics data returned",
                    content = @Content(schema = @Schema(implementation = AnalyticsResponse.class))
            ),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Caller does not have ADMIN role")
    })
    public ResponseEntity<AnalyticsResponse> getAnalytics() {
        // Platform-wide totals
        long totalAttempts = resultRepository.countTotalAttempts();
        long passedAttempts = resultRepository.countPassedAttempts();
        BigDecimal avgScore = resultRepository.findAverageScore();

        BigDecimal passRate = totalAttempts == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(passedAttempts * 100L)
                        .divide(BigDecimal.valueOf(totalAttempts), 2, RoundingMode.HALF_UP);

        BigDecimal averageScore = avgScore != null
                ? avgScore.setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Per-exam stats from aggregation query
        List<Object[]> perExamRaw = resultRepository.findPerExamStats();
        List<AnalyticsResponse.ExamStat> examStats = new ArrayList<>();

        for (Object[] row : perExamRaw) {
            Long examId      = (Long)    row[0];
            String examTitle = (String)  row[1];
            long examTotal   = ((Number) row[2]).longValue();
            long examPassed  = ((Number) row[3]).longValue();
            BigDecimal examAvg = row[4] != null
                    ? new BigDecimal(row[4].toString()).setScale(2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            BigDecimal examPassRate = examTotal == 0
                    ? BigDecimal.ZERO
                    : BigDecimal.valueOf(examPassed * 100L)
                            .divide(BigDecimal.valueOf(examTotal), 2, RoundingMode.HALF_UP);

            // Difficulty breakdown: count questions at each difficulty level for this exam
            Map<String, Long> difficultyBreakdown = buildDifficultyBreakdown(examId);

            examStats.add(new AnalyticsResponse.ExamStat(
                    examId,
                    examTitle,
                    examTotal,
                    examPassRate,
                    examAvg,
                    difficultyBreakdown
            ));
        }

        return ResponseEntity.ok(new AnalyticsResponse(
                totalAttempts,
                passRate,
                averageScore,
                examStats
        ));
    }

    // ─── Users ────────────────────────────────────────────────────────────────

    /**
     * GET /api/admin/users — paginated list of all user accounts
     */
    @GetMapping("/users")
    @Operation(
            summary = "List all users",
            description = "Returns a paginated list of all user accounts with roles and registration dates. " +
                    "passwordHash is never included in the response."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Page of users returned",
                    content = @Content(schema = @Schema(implementation = UserResponse.class))
            ),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Caller does not have ADMIN role")
    })
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }

    /**
     * GET /api/admin/users/{id} — get a single user by ID
     */
    @GetMapping("/users/{id}")
    @Operation(
            summary = "Get user by ID",
            description = "Returns the user account with the given ID. passwordHash is excluded."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "User found",
                    content = @Content(schema = @Schema(implementation = UserResponse.class))
            ),
            @ApiResponse(responseCode = "404", description = "User not found"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Caller does not have ADMIN role")
    })
    public ResponseEntity<UserResponse> getUser(
            @Parameter(description = "ID of the user to retrieve") @PathVariable Long id) {
        return ResponseEntity.ok(userService.getUser(id));
    }

    /**
     * PUT /api/admin/users/{id} — update a user's profile fields
     */
    @PutMapping("/users/{id}")
    @Operation(
            summary = "Update user",
            description = "Updates a user's profile. Updatable fields: name (all roles), " +
                    "department and yearOfStudy (STUDENT role only), enabled flag. " +
                    "All fields are optional — only provided non-null values are applied."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "User updated successfully",
                    content = @Content(schema = @Schema(implementation = UserResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Validation error in request body"),
            @ApiResponse(responseCode = "404", description = "User not found"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Caller does not have ADMIN role")
    })
    public ResponseEntity<UserResponse> updateUser(
            @Parameter(description = "ID of the user to update") @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    /**
     * DELETE /api/admin/users/{id} — disable a user account (soft delete)
     *
     * Guards against self-deletion: throws 400 if the admin attempts to delete
     * their own account.
     */
    @DeleteMapping("/users/{id}")
    @Operation(
            summary = "Delete (disable) user",
            description = "Disables the user account with the given ID. " +
                    "An admin cannot delete their own account — a 400 is returned in that case. " +
                    "This is a soft delete: the account is disabled, not permanently removed."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "User disabled successfully"),
            @ApiResponse(responseCode = "400",
                    description = "Admin attempted to delete their own account"),
            @ApiResponse(responseCode = "404", description = "User not found"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Caller does not have ADMIN role")
    })
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "ID of the user to disable") @PathVariable Long id,
            Authentication authentication) {
        String callerEmail = authentication.getName();
        userService.deleteUser(id, callerEmail);
        return ResponseEntity.noContent().build();
    }

    // ─── Private helpers ───────────────────────────────────────────────────────

    /**
     * Builds a difficulty breakdown map for a given exam by loading the exam's
     * question list and counting questions per difficulty level.
     *
     * Uses the in-memory exam questions collection to avoid an extra aggregation
     * query, which keeps this readable and compatible with all JPA backends.
     */
    private Map<String, Long> buildDifficultyBreakdown(Long examId) {
        Optional<Exam> examOpt = examRepository.findById(examId);
        Map<String, Long> breakdown = new HashMap<>();
        examOpt.ifPresent(exam -> {
            exam.getQuestions().forEach(question -> {
                String diffLabel = question.getDifficulty() != null
                        ? question.getDifficulty().name()
                        : "UNKNOWN";
                breakdown.merge(diffLabel, 1L, Long::sum);
            });
        });
        return breakdown;
    }
}
