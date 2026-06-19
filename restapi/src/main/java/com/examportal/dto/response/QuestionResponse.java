package com.examportal.dto.response;

import com.examportal.entity.Question;
import com.examportal.enums.Difficulty;

/**
 * Response DTO for a question.
 * IMPORTANT: correctAnswer is intentionally excluded — it must never be
 * returned to students to prevent answer leakage.
 * Requirements: 5.1, 18.6
 */
public record QuestionResponse(

        Long questionId,

        String questionText,

        String optionA,

        String optionB,

        String optionC,

        String optionD,

        Integer marks,

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
