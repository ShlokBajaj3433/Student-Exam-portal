package com.examportal.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/**
 * DTO representing a single answer within an exam attempt.
 *
 * <p>Which field to populate depends on the question type:
 * <ul>
 *   <li>MCQ            — set {@code selectedOption} (A/B/C/D or null to skip)</li>
 *   <li>MULTIPLE_CHOICE— set {@code selectedOptions} as comma-separated letters, e.g. "A,C"</li>
 *   <li>SHORT_ANSWER   — set {@code writtenAnswer} with free text</li>
 * </ul>
 */
@Schema(description = "A single answer for one question in an exam attempt")
public record AnswerDto(

        @Schema(description = "ID of the question being answered", example = "42",
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull(message = "Question ID must not be null")
        Long questionId,

        @Schema(description = "MCQ: selected option — A, B, C, or D. Null = skipped.",
                example = "B", allowableValues = {"A", "B", "C", "D"}, nullable = true)
        @Pattern(regexp = "[ABCD]", message = "selectedOption must be one of: A, B, C, D")
        String selectedOption,

        @Schema(description = "MULTIPLE_CHOICE: comma-separated selected letters, e.g. \"A,C\"",
                example = "A,C", nullable = true)
        String selectedOptions,

        @Schema(description = "SHORT_ANSWER: student's free-text answer",
                example = "Binary search has O(log n) time complexity.", nullable = true)
        String writtenAnswer

) {
    /** Returns selectedOption as a Character, or null if skipped/N/A. */
    public Character selectedOptionChar() {
        return selectedOption != null && !selectedOption.isBlank() ? selectedOption.charAt(0) : null;
    }
}
