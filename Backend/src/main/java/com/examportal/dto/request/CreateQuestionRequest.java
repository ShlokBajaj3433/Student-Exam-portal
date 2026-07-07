package com.examportal.dto.request;

import com.examportal.enums.Difficulty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/**
 * Request DTO for creating a new question in the question bank.
 * Requirements: 5.1–5.4, 17.8–17.9
 */
@Schema(description = "Request body for creating a new multiple-choice question")
public record CreateQuestionRequest(

        @Schema(description = "The question text", example = "Which keyword is used to prevent method overriding in Java?", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Question text must not be blank")
        String questionText,

        @Schema(description = "Text for option A", example = "static", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Option A must not be blank")
        String optionA,

        @Schema(description = "Text for option B", example = "final", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Option B must not be blank")
        String optionB,

        @Schema(description = "Text for option C", example = "abstract", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Option C must not be blank")
        String optionC,

        @Schema(description = "Text for option D", example = "private", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Option D must not be blank")
        String optionD,

        @Schema(description = "The letter of the correct answer — must be A, B, C, or D", example = "B", allowableValues = {"A", "B", "C", "D"}, requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull(message = "Correct answer must not be null")
        @Pattern(regexp = "[ABCD]", message = "Correct answer must be one of: A, B, C, D")
        String correctAnswer,

        @Schema(description = "Marks awarded for a correct answer (minimum 1)", example = "2", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull(message = "Marks must not be null")
        @Min(value = 1, message = "Marks must be at least 1")
        Integer marks,

        @Schema(description = "Difficulty level of the question", example = "MEDIUM", allowableValues = {"EASY", "MEDIUM", "HARD"})
        Difficulty difficulty

) {
    /**
     * Returns correctAnswer as a Character for mapping to the entity.
     */
    public Character correctAnswerChar() {
        return correctAnswer != null ? correctAnswer.charAt(0) : null;
    }
}
