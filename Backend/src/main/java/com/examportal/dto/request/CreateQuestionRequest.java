package com.examportal.dto.request;

import com.examportal.enums.Difficulty;
import com.examportal.enums.QuestionType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/**
 * Request DTO for creating a new question.
 *
 * <p>Field requirements vary by questionType:
 * <ul>
 *   <li>MCQ            — optionA–D required, correctAnswer required (A/B/C/D), correctAnswers null, modelAnswer null</li>
 *   <li>MULTIPLE_CHOICE— optionA–D required, correctAnswers required (e.g. "A,C"), correctAnswer null, modelAnswer null</li>
 *   <li>SHORT_ANSWER   — optionA–D null, correctAnswer null, correctAnswers null, modelAnswer required</li>
 * </ul>
 *
 * Cross-field validation is enforced in QuestionServiceImpl.
 */
@Schema(description = "Request body for creating a question. Supply fields appropriate for the chosen questionType.")
public record CreateQuestionRequest(

        @Schema(description = "Question type", example = "MCQ",
                allowableValues = {"MCQ", "MULTIPLE_CHOICE", "SHORT_ANSWER"},
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull(message = "Question type must not be null")
        QuestionType questionType,

        @Schema(description = "The question text", example = "Which of the following are valid Java access modifiers?",
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Question text must not be blank")
        String questionText,

        @Schema(description = "Option A text — required for MCQ and MULTIPLE_CHOICE", example = "public")
        String optionA,

        @Schema(description = "Option B text — required for MCQ and MULTIPLE_CHOICE", example = "final")
        String optionB,

        @Schema(description = "Option C text — required for MCQ and MULTIPLE_CHOICE", example = "protected")
        String optionC,

        @Schema(description = "Option D text — required for MCQ and MULTIPLE_CHOICE", example = "static")
        String optionD,

        @Schema(description = "Single correct option letter — required for MCQ only",
                example = "B", allowableValues = {"A", "B", "C", "D"})
        @Pattern(regexp = "[ABCD]", message = "correctAnswer must be one of: A, B, C, D")
        String correctAnswer,

        @Schema(description = "Comma-separated correct option letters — required for MULTIPLE_CHOICE only",
                example = "A,C")
        String correctAnswers,

        @Schema(description = "Model/reference answer — required for SHORT_ANSWER only",
                example = "The four access modifiers in Java are public, protected, package-private, and private.")
        String modelAnswer,

        @Schema(description = "Marks awarded for a fully correct answer (minimum 1)",
                example = "2", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull(message = "Marks must not be null")
        @Min(value = 1, message = "Marks must be at least 1")
        Integer marks,

        @Schema(description = "Difficulty level", example = "MEDIUM",
                allowableValues = {"EASY", "MEDIUM", "HARD"})
        Difficulty difficulty

) {
    /** Returns correctAnswer as a Character, or null if not set. */
    public Character correctAnswerChar() {
        return correctAnswer != null && !correctAnswer.isBlank() ? correctAnswer.charAt(0) : null;
    }
}
