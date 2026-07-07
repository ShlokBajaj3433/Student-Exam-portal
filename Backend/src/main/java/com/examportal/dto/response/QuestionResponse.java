package com.examportal.dto.response;

import com.examportal.entity.Question;
import com.examportal.enums.Difficulty;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Response DTO for a question.
 * IMPORTANT: correctAnswer is intentionally excluded — it must never be
 * returned to students to prevent answer leakage.
 * Requirements: 5.1, 18.6
 */
@Schema(description = "A multiple-choice question. The correctAnswer field is intentionally omitted to prevent answer leakage.")
public record QuestionResponse(

        @Schema(description = "Unique question ID", example = "42")
        Long questionId,

        @Schema(description = "The question text", example = "Which keyword prevents method overriding in Java?")
        String questionText,

        @Schema(description = "Text for answer option A", example = "static")
        String optionA,

        @Schema(description = "Text for answer option B", example = "final")
        String optionB,

        @Schema(description = "Text for answer option C", example = "abstract")
        String optionC,

        @Schema(description = "Text for answer option D", example = "private")
        String optionD,

        @Schema(description = "Marks awarded for a correct answer", example = "2")
        Integer marks,

        @Schema(description = "Difficulty level of the question", example = "MEDIUM")
        Difficulty difficulty

) {
    /**
     * Converts a {@link Question} entity to a {@code QuestionResponse},
     * omitting the correct answer.
     */
    public static QuestionResponse from(Question question) {
        return new QuestionResponse(
                question.getQuestionId(),
                question.getQuestionText(),
                question.getOptionA(),
                question.getOptionB(),
                question.getOptionC(),
                question.getOptionD(),
                question.getMarks(),
                question.getDifficulty()
        );
    }
}
