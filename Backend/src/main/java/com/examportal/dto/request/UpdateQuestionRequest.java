package com.examportal.dto.request;

import com.examportal.enums.Difficulty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;

/**
 * Request DTO for updating an existing question. All fields are optional —
 * only non-null values will be applied.
 * Requirements: 5.5, 17.8–17.9
 */
@Schema(description = "Request body for updating an existing question. All fields are optional — only supplied non-null values are applied.")
public record UpdateQuestionRequest(

        @Schema(description = "Updated question text", example = "Which keyword prevents class inheritance in Java?")
        String questionText,

        @Schema(description = "Updated text for option A", example = "static")
        String optionA,

        @Schema(description = "Updated text for option B", example = "final")
        String optionB,

        @Schema(description = "Updated text for option C", example = "abstract")
        String optionC,

        @Schema(description = "Updated text for option D", example = "sealed")
        String optionD,

        @Schema(description = "Updated correct answer — must be A, B, C, or D", example = "B", allowableValues = {"A", "B", "C", "D"})
        @Pattern(regexp = "[ABCD]", message = "Correct answer must be one of: A, B, C, D")
        String correctAnswer,

        @Schema(description = "Updated marks for a correct answer (minimum 1)", example = "3")
        @Min(value = 1, message = "Marks must be at least 1")
        Integer marks,

        @Schema(description = "Updated difficulty level", example = "HARD", allowableValues = {"EASY", "MEDIUM", "HARD"})
        Difficulty difficulty

) {
    /**
     * Returns correctAnswer as a Character for mapping to the entity.
     */
    public Character correctAnswerChar() {
        return correctAnswer != null ? correctAnswer.charAt(0) : null;
    }
}
