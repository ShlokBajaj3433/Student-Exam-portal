package com.examportal.controller;

import com.examportal.dto.request.CreateQuestionRequest;
import com.examportal.dto.request.UpdateQuestionRequest;
import com.examportal.dto.response.QuestionResponse;
import com.examportal.service.QuestionService;
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
 * REST controller for admin question bank management operations.
 *
 * All endpoints require ADMIN role, enforced both by the SecurityConfig
 * path rules ({@code /api/questions/**} → ADMIN) and the method-level
 * {@code @PreAuthorize} for defence-in-depth.

 */
@RestController
@RequestMapping("/api/questions")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Question", description = "Admin question bank management: CRUD operations")
@SecurityRequirement(name = "bearerAuth")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    // GET /api/questions — paginated list of all questions

    @GetMapping
    @Operation(
            summary = "List all questions",
            description = "Returns a paginated list of all questions in the question bank (ADMIN only). " +
                    "The correctAnswer field is intentionally omitted from responses."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Page of questions returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Caller does not have ADMIN role")
    })
    public ResponseEntity<Page<QuestionResponse>> getAllQuestions(
            @PageableDefault(size = 20, sort = "questionId") Pageable pageable) {
        return ResponseEntity.ok(questionService.getAllQuestions(pageable));
    }

    // POST /api/questions — create a new question

    @PostMapping
    @Operation(
            summary = "Create a question",
            description = "Creates a new question in the question bank. " +
                    "correctAnswer must be one of: A, B, C, D."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Question created successfully",
                    content = @Content(schema = @Schema(implementation = QuestionResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Validation error in request body"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Caller does not have ADMIN role")
    })
    public ResponseEntity<QuestionResponse> createQuestion(
            @Valid @RequestBody CreateQuestionRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        QuestionResponse created = questionService.createQuestion(request, principal.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // GET /api/questions/{id} — get a single question by ID

    @GetMapping("/{id}")
    @Operation(
            summary = "Get question by ID",
            description = "Returns the question with the given ID."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Question found",
                    content = @Content(schema = @Schema(implementation = QuestionResponse.class))
            ),
            @ApiResponse(responseCode = "404", description = "Question not found"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Caller does not have ADMIN role")
    })
    public ResponseEntity<QuestionResponse> getQuestion(
            @Parameter(description = "ID of the question to retrieve") @PathVariable Long id) {
        return ResponseEntity.ok(questionService.getQuestion(id));
    }

    // PUT /api/questions/{id} — update an existing question

    @PutMapping("/{id}")
    @Operation(
            summary = "Update a question",
            description = "Updates an existing question. All fields are optional — " +
                    "only provided (non-null) fields are changed."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Question updated successfully",
                    content = @Content(schema = @Schema(implementation = QuestionResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Validation error in request body"),
            @ApiResponse(responseCode = "404", description = "Question not found"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Caller does not have ADMIN role")
    })
    public ResponseEntity<QuestionResponse> updateQuestion(
            @Parameter(description = "ID of the question to update") @PathVariable Long id,
            @Valid @RequestBody UpdateQuestionRequest request) {
        return ResponseEntity.ok(questionService.updateQuestion(id, request));
    }

    // DELETE /api/questions/{id} — delete a question

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete a question",
            description = "Deletes a question from the question bank. " +
                    "Deletion is rejected with 409 Conflict if the question is assigned to a PUBLISHED exam."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Question deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Question not found"),
            @ApiResponse(
                    responseCode = "409",
                    description = "Question is assigned to a PUBLISHED exam and cannot be deleted"
            ),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Caller does not have ADMIN role")
    })
    public ResponseEntity<Void> deleteQuestion(
            @Parameter(description = "ID of the question to delete") @PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }
}
