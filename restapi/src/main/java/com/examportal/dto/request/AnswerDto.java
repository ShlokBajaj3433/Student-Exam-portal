package com.examportal.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/**
 * DTO representing a single answer selection within a submit-exam request.
 * selectedOption is nullable — a null value represents a skipped question.
 * Requirements: 10.1–10.4, 17.10
 */
public record AnswerDto(

        @NotNull(message = "Question ID must not be null")
        Long questionId,

        // null means the question was skipped; if provided must be A, B, C, or D
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
