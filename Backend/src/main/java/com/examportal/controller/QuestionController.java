package com.examportal.controller;

import com.examportal.dto.request.CreateQuestionRequest;
import com.examportal.dto.request.UpdateQuestionRequest;
import com.examportal.dto.response.AdminQuestionResponse;
import com.examportal.service.QuestionService;
import com.examportal.service.QuestionExcelService;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import java.io.IOException;
import java.util.Map;
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
import org.springframework.web.bind.annotation.*;

/**
 * Admin question bank management. Returns AdminQuestionResponse (includes answer fields).
 */
@RestController
@RequestMapping("/api/questions")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Question", description = "Admin question bank management: CRUD operations")
@SecurityRequirement(name = "bearerAuth")
public class QuestionController {

    private final QuestionService questionService;
    private final QuestionExcelService excelService;

    public QuestionController(QuestionService questionService, QuestionExcelService excelService) {
        this.questionService = questionService;
        this.excelService = excelService;
    }

    @GetMapping("/import/template")
    @Operation(summary = "Download Excel question import template")
    public ResponseEntity<byte[]> downloadTemplate() throws IOException {
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=question-import-template.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelService.template());
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Bulk import questions from Excel", description = "Imports the first worksheet; maximum 500 questions and 1 MB. All rows must be valid.")
    public ResponseEntity<Map<String, Integer>> importQuestions(@RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("importedCount", excelService.importQuestions(file, principal.getUsername())));
    }

    @GetMapping
    @Operation(summary = "List all questions (admin)", description = "Returns paginated question bank including answer fields.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Page of questions"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
            @ApiResponse(responseCode = "403", description = "Not ADMIN role")
    })
    public ResponseEntity<Page<AdminQuestionResponse>> getAllQuestions(
            @PageableDefault(size = 20, sort = "questionId") Pageable pageable) {
        return ResponseEntity.ok(questionService.getAllQuestions(pageable));
    }

    @PostMapping
    @Operation(summary = "Create a question",
            description = "Supports MCQ, MULTIPLE_CHOICE, and SHORT_ANSWER types.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Question created",
                    content = @Content(schema = @Schema(implementation = AdminQuestionResponse.class))),
            @ApiResponse(responseCode = "400", description = "Validation error"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
            @ApiResponse(responseCode = "403", description = "Not ADMIN role")
    })
    public ResponseEntity<AdminQuestionResponse> createQuestion(
            @Valid @RequestBody CreateQuestionRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(questionService.createQuestion(request, principal.getUsername()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get question by ID (admin)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Question found",
                    content = @Content(schema = @Schema(implementation = AdminQuestionResponse.class))),
            @ApiResponse(responseCode = "404", description = "Not found"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
            @ApiResponse(responseCode = "403", description = "Not ADMIN role")
    })
    public ResponseEntity<AdminQuestionResponse> getQuestion(
            @Parameter(description = "Question ID") @PathVariable Long id) {
        return ResponseEntity.ok(questionService.getQuestion(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a question")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Question updated",
                    content = @Content(schema = @Schema(implementation = AdminQuestionResponse.class))),
            @ApiResponse(responseCode = "400", description = "Validation error"),
            @ApiResponse(responseCode = "404", description = "Not found"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
            @ApiResponse(responseCode = "403", description = "Not ADMIN role")
    })
    public ResponseEntity<AdminQuestionResponse> updateQuestion(
            @Parameter(description = "Question ID") @PathVariable Long id,
            @Valid @RequestBody UpdateQuestionRequest request) {
        return ResponseEntity.ok(questionService.updateQuestion(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a question")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Deleted"),
            @ApiResponse(responseCode = "404", description = "Not found"),
            @ApiResponse(responseCode = "409", description = "Assigned to a PUBLISHED exam"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
            @ApiResponse(responseCode = "403", description = "Not ADMIN role")
    })
    public ResponseEntity<Void> deleteQuestion(
            @Parameter(description = "Question ID") @PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }
}
