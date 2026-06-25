package com.examportal.controller;

import com.examportal.dto.request.AssignQuestionsRequest;
import com.examportal.dto.request.CreateExamRequest;
import com.examportal.dto.request.UpdateExamRequest;
import com.examportal.dto.response.ExamResponse;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for admin exam management operations.
 *
 * All endpoints require ADMIN role (enforced via SecurityConfig path rules
 * and additionally via method-level @PreAuthorize for clarity).
 *
 */
@RestController
@RequestMapping("/api/exams")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Exam", description = "Admin exam management: CRUD, lifecycle transitions, and question assignment")
@SecurityRequirement(name = "bearerAuth")
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    // GET /api/exams — paginated list of all exams

    @GetMapping
    @Operation(
            summary = "List all exams",
            description = "Returns a paginated list of all exams regardless of status (ADMIN only)."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Page of exams returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Caller does not have ADMIN role")
    })
    public ResponseEntity<Page<ExamResponse>> getAllExams(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(examService.getAllExams(pageable));
    }

    // POST /api/exams — create a new exam

    @PostMapping
    @Operation(
            summary = "Create an exam",
            description = "Creates a new exam in DRAFT status. " +
                    "If both startTime and endTime are provided, endTime must be after startTime."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Exam created successfully",
                    content = @Content(schema = @Schema(implementation = ExamResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Validation error in request body"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Caller does not have ADMIN role")
    })
    public ResponseEntity<ExamResponse> createExam(
            @Valid @RequestBody CreateExamRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        ExamResponse created = examService.createExam(request, principal.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // GET /api/exams/{id} — get a single exam by ID

    @GetMapping("/{id}")
    @Operation(summary = "Get exam by ID", description = "Returns the exam with the given ID.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Exam found",
                    content = @Content(schema = @Schema(implementation = ExamResponse.class))
            ),
            @ApiResponse(responseCode = "404", description = "Exam not found"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Caller does not have ADMIN role")
    })
    public ResponseEntity<ExamResponse> getExam(
            @Parameter(description = "ID of the exam to retrieve") @PathVariable Long id) {
        return ResponseEntity.ok(examService.getExam(id));
    }

    // PUT /api/exams/{id} — update an existing DRAFT exam

    @PutMapping("/{id}")
    @Operation(
            summary = "Update an exam",
            description = "Updates an existing exam. Only exams in DRAFT status can be updated. " +
                    "All fields are optional — only provided (non-null) fields are changed."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Exam updated successfully",
                    content = @Content(schema = @Schema(implementation = ExamResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Validation error in request body"),
            @ApiResponse(responseCode = "404", description = "Exam not found"),
            @ApiResponse(responseCode = "409", description = "Exam is not in DRAFT status"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Caller does not have ADMIN role")
    })
    public ResponseEntity<ExamResponse> updateExam(
            @Parameter(description = "ID of the exam to update") @PathVariable Long id,
            @Valid @RequestBody UpdateExamRequest request) {
        return ResponseEntity.ok(examService.updateExam(id, request));
    }

    // DELETE /api/exams/{id} — delete an exam

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete an exam",
            description = "Deletes an exam and all its question assignments."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Exam deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Exam not found"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Caller does not have ADMIN role")
    })
    public ResponseEntity<Void> deleteExam(
            @Parameter(description = "ID of the exam to delete") @PathVariable Long id) {
        examService.deleteExam(id);
        return ResponseEntity.noContent().build();
    }

    // POST /api/exams/{id}/publish — publish a DRAFT exam

    @PostMapping("/{id}/publish")
    @Operation(
            summary = "Publish an exam",
            description = "Transitions an exam from DRAFT to PUBLISHED status. " +
                    "The exam must have at least one question assigned."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Exam published successfully",
                    content = @Content(schema = @Schema(implementation = ExamResponse.class))
            ),
            @ApiResponse(responseCode = "404", description = "Exam not found"),
            @ApiResponse(
                    responseCode = "409",
                    description = "Exam is not in DRAFT status, or has no questions assigned"
            ),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Caller does not have ADMIN role")
    })
    public ResponseEntity<ExamResponse> publishExam(
            @Parameter(description = "ID of the exam to publish") @PathVariable Long id) {
        return ResponseEntity.ok(examService.publishExam(id));
    }

    // POST /api/exams/{id}/close — close a PUBLISHED exam

    @PostMapping("/{id}/close")
    @Operation(
            summary = "Close an exam",
            description = "Transitions an exam from PUBLISHED to CLOSED status."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Exam closed successfully",
                    content = @Content(schema = @Schema(implementation = ExamResponse.class))
            ),
            @ApiResponse(responseCode = "404", description = "Exam not found"),
            @ApiResponse(responseCode = "409", description = "Exam is not in PUBLISHED status"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Caller does not have ADMIN role")
    })
    public ResponseEntity<ExamResponse> closeExam(
            @Parameter(description = "ID of the exam to close") @PathVariable Long id) {
        return ResponseEntity.ok(examService.closeExam(id));
    }

    // POST /api/exams/{id}/questions — assign questions to a DRAFT exam

    @PostMapping("/{id}/questions")
    @Operation(
            summary = "Assign questions to an exam",
            description = "Assigns a list of questions to a DRAFT exam. " +
                    "The exam must be in DRAFT status; PUBLISHED/CLOSED exams are rejected with 409."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Questions assigned successfully",
                    content = @Content(schema = @Schema(implementation = ExamResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Validation error — question IDs list is empty"),
            @ApiResponse(responseCode = "404", description = "Exam or one of the question IDs not found"),
            @ApiResponse(
                    responseCode = "409",
                    description = "Exam is not in DRAFT status"
            ),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Caller does not have ADMIN role")
    })
    public ResponseEntity<ExamResponse> assignQuestions(
            @Parameter(description = "ID of the target exam") @PathVariable Long id,
            @Valid @RequestBody AssignQuestionsRequest request) {
        return ResponseEntity.ok(examService.assignQuestions(id, request.questionIds()));
    }
}
