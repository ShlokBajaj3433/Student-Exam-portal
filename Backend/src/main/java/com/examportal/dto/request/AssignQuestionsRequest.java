package com.examportal.dto.request;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

/**
 * Request DTO for assigning questions to an exam in DRAFT status.
 * Requirements: 6.1–6.2
 */
public record AssignQuestionsRequest(

        @NotEmpty(message = "Question IDs list must not be empty")
        List<Long> questionIds

) {}
