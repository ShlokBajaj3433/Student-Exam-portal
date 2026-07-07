package com.examportal.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

/**
 * Request DTO for assigning questions to an exam in DRAFT status.
 * Requirements: 6.1–6.2
 */
@Schema(description = "Request body for assigning questions to a DRAFT exam")
public record AssignQuestionsRequest(

        @Schema(description = "Non-empty list of question IDs to assign to the exam", example = "[1, 5, 12, 20]", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotEmpty(message = "Question IDs list must not be empty")
        List<Long> questionIds

) {}
