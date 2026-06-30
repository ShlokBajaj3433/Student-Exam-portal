package com.examportal.controller;

import com.examportal.dto.request.AnswerDto;
import com.examportal.dto.response.AttemptSummaryResponse;
import com.examportal.dto.response.ExamAttemptResponse;
import com.examportal.dto.response.ExamResponse;
import com.examportal.service.ExamAttemptService;
import com.examportal.service.ExamService;
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

import java.util.List;

/**
 * REST controller for student exam browsing and attempt endpoints.
 *
 * All endpoints require STUDENT role (enforced via SecurityConfig path rules
 * and additionally via class-level @PreAuthorize for clarity).
 *
 * Requirements: 7.5, 9.1–9.5, 10.1–10.4, 13.4, 18.6
 */
@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
@Tag(name = "Student", description = "Student exam browsing and attempt endpoints")
@SecurityRequirement(name = "bearerAuth")
public class StudentExamController {

    private final ExamService examService;
    private final ExamAttemptService examAttemptService;

    public StudentExamController(ExamService examService,
                                 ExamAttemptService examAttemptService) {
        this.examService = examService;
        this.examAttemptService = examAttemptService;
    }

    // ─── Exam browsing ────────────────────────────────────────────────────────

    /**
     * GET /api/student/exams — paginated list of currently available published exams.
     *
     * Returns only exams with status = PUBLISHED whose active window
     * covers the current time (startTime &lt;= now &lt;= endTime).
     *
     * Requirements: 7.4, 7.5
     */
    @GetMapping("/exams")
    @Operation(
            summary = "List available exams",
            description = "Returns a paginated list of PUBLISHED exams whose active window " +
                    "covers the current time. Only accessible to students."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Page of available published exams returned",
                    content = @Content(schema = @Schema(implementation = ExamResponse.class))
            ),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Caller does not have STUDENT role")
    })
    public ResponseEntity<Page<ExamResponse>> getPublishedExams(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(examService.getPublishedExams(pageable));
    }

    // ─── Exam attempt lifecycle ───────────────────────────────────────────────

    /**
     * POST /api/student/startExam?examId={id} — start a new exam attempt.
     *
     * Creates an ExamAttempt with status IN_PROGRESS and returns the attempt
     * details together with the shuffled question list (correct answers excluded).
     *
     * Requirements: 9.1–9.5
     */
    @PostMapping("/startExam")
    @Operation(
            summary = "Start exam attempt",
            description = "Starts a new exam attempt for the authenticated student. " +
                    "The exam must be PUBLISHED and within its active time window. " +
                    "Returns the attempt ID, exam metadata, deadline, and shuffled question list."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Attempt created successfully",
                    content = @Content(schema = @Schema(implementation = ExamAttemptResponse.class))
            ),
            @ApiResponse(responseCode = "404", description = "Exam not found"),
            @ApiResponse(responseCode = "409",
                    description = "Exam not PUBLISHED, outside time window, or duplicate active attempt"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Caller does not have STUDENT role")
    })
    public ResponseEntity<ExamAttemptResponse> startExam(
            @Parameter(description = "ID of the exam to start", required = true)
            @RequestParam Long examId,
            Authentication authentication) {
        String studentEmail = authentication.getName();
        return ResponseEntity.ok(examAttemptService.startExam(examId, studentEmail));
    }

    /**
     * PATCH /api/student/answer — save (upsert) a single answer during an active attempt.
     *
     * The question can be answered multiple times while the attempt is IN_PROGRESS;
     * each call upserts the StudentAnswer record for the (attempt, question) pair.
     * A null selectedOption indicates a skipped question.
     *
     * Requirements: 10.1–10.4
     */
    @PatchMapping("/answer")
    @Operation(
            summary = "Save answer",
            description = "Saves or updates a single answer for an IN_PROGRESS exam attempt. " +
                    "Calling this multiple times for the same question updates the stored answer. " +
                    "Set selectedOption to null to mark a question as skipped."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Answer saved successfully"),
            @ApiResponse(responseCode = "400",
                    description = "Invalid selectedOption (must be A, B, C, D, or null)"),
            @ApiResponse(responseCode = "404", description = "Attempt or question not found"),
            @ApiResponse(responseCode = "409",
                    description = "Attempt is not IN_PROGRESS (already submitted or timed out)"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403",
                    description = "Caller does not have STUDENT role or does not own the attempt")
    })
    public ResponseEntity<Void> saveAnswer(
            @Parameter(description = "ID of the in-progress attempt", required = true)
            @RequestParam Long attemptId,
            @Valid @RequestBody AnswerDto answerDto,
            Authentication authentication) {
        String studentEmail = authentication.getName();
        examAttemptService.saveAnswer(attemptId, answerDto, studentEmail);
        return ResponseEntity.ok().build();
    }

    /**
     * GET /api/student/attempts — list all past attempt summaries for the authenticated student.
     *
     * Requirements: 13.4
     */
    @GetMapping("/attempts")
    @Operation(
            summary = "Get attempt history",
            description = "Returns a list of all past exam attempt summaries for the " +
                    "authenticated student, including exam title, attempt date, score, and status."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Attempt history returned successfully"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Caller does not have STUDENT role")
    })
    public ResponseEntity<List<AttemptSummaryResponse>> getAttemptHistory(
            Authentication authentication) {
        String studentEmail = authentication.getName();
        return ResponseEntity.ok(examAttemptService.getAttemptHistory(studentEmail));
    }
}
