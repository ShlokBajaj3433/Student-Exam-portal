package com.examportal.enums;

/**
 * Defines the type of a question in the question bank.
 *
 * <ul>
 *   <li>{@code MCQ}             – Single correct option (A/B/C/D). Auto-evaluated.</li>
 *   <li>{@code MULTIPLE_CHOICE} – One or more correct options. Auto-evaluated by
 *                                  exact match of the selected set.</li>
 *   <li>{@code SHORT_ANSWER}    – Student writes a free-text answer. Stored for
 *                                  manual grading by admin; auto-score = 0 until graded.</li>
 * </ul>
 */
public enum QuestionType {
    MCQ,
    MULTIPLE_CHOICE,
    SHORT_ANSWER
}
