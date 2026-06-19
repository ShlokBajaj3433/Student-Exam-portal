package com.examportal.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * Request DTO for submitting a completed exam attempt.
 * Requirements: 11.1–11.9
 */
public record SubmitExamRequest(

        @NotNull(message = "Attempt ID must not be null")
        Long attemptId,

        @NotNull(message = "Answers list must not be null")
        @NotEmpty(message = "Answers list must not be empty")
        @Valid
        List<AnswerDto> answers

) {}
