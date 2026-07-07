package com.examportal.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * Request DTO for submitting a completed exam attempt.
 * Requirements: 11.1–11.9
 */
@Schema(description = "Request body for submitting a completed exam attempt with all answers")
public record SubmitExamRequest(

        @Schema(description = "ID of the in-progress exam attempt to submit", example = "7", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull(message = "Attempt ID must not be null")
        Long attemptId,

        @Schema(description = "List of answer selections for the attempt — must not be empty", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull(message = "Answers list must not be null")
        @NotEmpty(message = "Answers list must not be empty")
        @Valid
        List<AnswerDto> answers

) {}
