package com.examportal.dto.request;

import com.examportal.enums.Difficulty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/**
 * Request DTO for creating a new question in the question bank.
 * Requirements: 5.1–5.4, 17.8–17.9
 */
public record CreateQuestionRequest(

        @NotBlank(message = "Question text must not be blank")
        String questionText,

        @NotBlank(message = "Option A must not be blank")
        String optionA,

        @NotBlank(message = "Option B must not be blank")
        String optionB,

        @NotBlank(message = "Option C must not be blank")
        String optionC,

        @NotBlank(message = "Option D must not be blank")
        String optionD,

        @NotNull(message = "Correct answer must not be null")
        @Pattern(regexp = "[ABCD]", message = "Correct answer must be one of: A, B, C, D")
        String correctAnswer,

        @NotNull(message = "Marks must not be null")
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
