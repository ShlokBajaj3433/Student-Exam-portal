package com.examportal.dto.request;

import com.examportal.enums.Difficulty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;

/**
 * Request DTO for updating an existing question. All fields are optional —
 * only non-null values will be applied.
 * Requirements: 5.5, 17.8–17.9
 */
public record UpdateQuestionRequest(

        String questionText,

        String optionA,

        String optionB,

        String optionC,

        String optionD,

        @Pattern(regexp = "[ABCD]", message = "Correct answer must be one of: A, B, C, D")
        String correctAnswer,

        @Min(value = 1, message = "Marks must be at least 1")
        Integer marks,

        Difficulty difficulty

) {
    /**
     * Returns correctAnswer as a Character for mapping to the entity.
     */
    public Character correctAnswerChar() {
        return correctAnswer != null ? correctAnswer.charAt(0) : null;
    }
}
