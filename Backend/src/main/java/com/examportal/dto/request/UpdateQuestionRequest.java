package com.examportal.dto.request;

import com.examportal.enums.Difficulty;
import com.examportal.enums.QuestionType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;

/**
 * Request DTO for updating an existing question. All fields are optional —
 * only non-null values are applied.
 */
@Schema(description = "Request body for updating a question. All fields optional.")
public record UpdateQuestionRequest(

        @Schema(description = "Updated question type", allowableValues = {"MCQ", "MULTIPLE_CHOICE", "SHORT_ANSWER"})
        QuestionType questionType,

        @Schema(description = "Updated question text")
        String questionText,

        @Schema(description = "Updated option A")
        String optionA,

        @Schema(description = "Updated option B")
        String optionB,

        @Schema(description = "Updated option C")
        String optionC,

        @Schema(description = "Updated option D")
        String optionD,

        @Schema(description = "Updated correct answer for MCQ — must be A, B, C, or D",
                allowableValues = {"A", "B", "C", "D"})
        @Pattern(regexp = "[ABCD]", message = "correctAnswer must be one of: A, B, C, D")
        String correctAnswer,

        @Schema(description = "Updated correct answers for MULTIPLE_CHOICE, comma-separated",
                example = "A,C")
        String correctAnswers,

        @Schema(description = "Updated model answer for SHORT_ANSWER")
        String modelAnswer,

        @Schema(description = "Updated marks (minimum 1)", example = "3")
        @Min(value = 1, message = "Marks must be at least 1")
        Integer marks,

        @Schema(description = "Updated difficulty level", allowableValues = {"EASY", "MEDIUM", "HARD"})
        Difficulty difficulty

) {
    public Character correctAnswerChar() {
        return correctAnswer != null && !correctAnswer.isBlank() ? correctAnswer.charAt(0) : null;
    }
}
