package com.examportal.dto.response;

import com.examportal.entity.Question;
import com.examportal.enums.Difficulty;
import com.examportal.enums.QuestionType;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Response DTO for a question.
 *
 * <p>correctAnswer, correctAnswers, and modelAnswer are intentionally
 * excluded to prevent answer leakage to students. The admin API uses
 * {@link AdminQuestionResponse} which includes those fields.
 */
@Schema(description = "A question as seen by a student — answer fields are omitted.")
public record QuestionResponse(

        @Schema(description = "Unique question ID", example = "42")
        Long questionId,

        @Schema(description = "Question type", example = "MCQ")
        QuestionType questionType,

        @Schema(description = "The question text")
        String questionText,

        @Schema(description = "Option A — null for SHORT_ANSWER questions")
        String optionA,

        @Schema(description = "Option B — null for SHORT_ANSWER questions")
        String optionB,

        @Schema(description = "Option C — null for SHORT_ANSWER questions")
        String optionC,

        @Schema(description = "Option D — null for SHORT_ANSWER questions")
        String optionD,

        @Schema(description = "Marks awarded for a fully correct answer", example = "2")
        Integer marks,

        @Schema(description = "Difficulty level", example = "MEDIUM")
        Difficulty difficulty

) {
    /** Builds a student-safe response (no answer fields). */
    public static QuestionResponse from(Question q) {
        return new QuestionResponse(
                q.getQuestionId(),
                q.getQuestionType(),
                q.getQuestionText(),
                q.getOptionA(),
                q.getOptionB(),
                q.getOptionC(),
                q.getOptionD(),
                q.getMarks(),
                q.getDifficulty()
        );
    }
}
