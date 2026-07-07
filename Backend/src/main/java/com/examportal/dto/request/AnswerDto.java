package com.examportal.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/**
 * DTO representing a single answer selection within a submit-exam request.
 * selectedOption is nullable — a null value represents a skipped question.
 * Requirements: 10.1–10.4, 17.10
 */
@Schema(description = "A single answer choice for one question in an exam attempt")
public record AnswerDto(

        @Schema(description = "ID of the question being answered", example = "42", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull(message = "Question ID must not be null")
        Long questionId,

        // null means the question was skipped; if provided must be A, B, C, or D
        @Schema(description = "Selected answer option — A, B, C, or D. Set to null to skip the question.", example = "B", allowableValues = {"A", "B", "C", "D"}, nullable = true)
        @Pattern(regexp = "[ABCD]", message = "Selected option must be one of: A, B, C, D")
        String selectedOption

) {
    /**
     * Returns selectedOption as a Character, or null if the question was skipped.
     */
    public Character selectedOptionChar() {
        return selectedOption != null ? selectedOption.charAt(0) : null;
    }
}
