package com.examportal.entity;

import com.examportal.enums.Difficulty;
import com.examportal.enums.QuestionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long questionId;

    // ── Question type ────────────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType questionType = QuestionType.MCQ;

    // ── Shared fields ────────────────────────────────────────────────────────
    @Column(nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Column(nullable = false)
    private Integer marks;

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty; // EASY | MEDIUM | HARD

    // ── MCQ / MULTIPLE_CHOICE option text ────────────────────────────────────
    // Nullable for SHORT_ANSWER questions
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;

    // ── MCQ: single correct answer ───────────────────────────────────────────
    // Used only when questionType == MCQ. Null for other types.
    @Column(length = 1)
    private Character correctAnswer; // 'A' | 'B' | 'C' | 'D'

    // ── MULTIPLE_CHOICE: set of correct option letters ───────────────────────
    // Stored as a comma-separated string, e.g. "A,C" or "B,D"
    // Used only when questionType == MULTIPLE_CHOICE. Null for other types.
    @Column(name = "correct_answers")
    private String correctAnswers;

    // ── SHORT_ANSWER: model/reference answer ────────────────────────────────
    // Used only when questionType == SHORT_ANSWER.
    // Visible to admins only; never sent to students.
    @Column(name = "model_answer", columnDefinition = "TEXT")
    private String modelAnswer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
}
