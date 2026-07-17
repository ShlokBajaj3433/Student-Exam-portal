package com.examportal.dto.response;

import com.examportal.entity.Question;
import com.examportal.enums.Difficulty;
import com.examportal.enums.QuestionType;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Response DTO for admin question management — includes answer fields.
 *
 * <p>NEVER return this to student-facing endpoints.
 */
@Schema(description = "Full question details including answer fields — admin use only.")
public record AdminQuestionResponse(

        @Schema(description = "Unique question ID", example = "42")
        Long questionId,

        @Schema(description = "Question type", example = "MCQ")
        QuestionType questionType,

        @Schema(description = "The question text")
        String questionText,

        @Schema(description = "Option A — null for SHORT_ANSWER")
        String optionA,

        @Schema(description = "Option B — null for SHORT_ANSWER")
        String optionB,

        @Schema(description = "Option C — null for SHORT_ANSWER")
        String optionC,

        @Schema(description = "Option D — null for SHORT_ANSWER")
        String optionD,

        @Schema(description = "Correct answer letter for MCQ (A/B/C/D)", example = "B")
        String correctAnswer,

        @Schema(description = "Comma-separated correct letters for MULTIPLE_CHOICE", example = "A,C")
        String correctAnswers,

        @Schema(description = "Model answer text for SHORT_ANSWER questions")
        String modelAnswer,

        @Schema(description = "Marks for a fully correct answer", example = "2")
        Integer marks,

        @Schema(description = "Difficulty level", example = "MEDIUM")
        Difficulty difficulty

) {
    public static AdminQuestionResponse from(Question q) {
        return new AdminQuestionResponse(
                q.getQuestionId(),
                q.getQuestionType(),
                q.getQuestionText(),
                q.getOptionA(),
                q.getOptionB(),
                q.getOptionC(),
                q.getOptionD(),
                q.getCorrectAnswer() != null ? String.valueOf(q.getCorrectAnswer()) : null,
                q.getCorrectAnswers(),
                q.getModelAnswer(),
                q.getMarks(),
                q.getDifficulty()
        );
    }
}
