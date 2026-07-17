package com.examportal.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "student_answers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long answerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private ExamAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    // ── MCQ answer ───────────────────────────────────────────────────────────
    @Column(length = 1)
    private Character selectedOption; // 'A'|'B'|'C'|'D' | null (skipped/N/A)

    // ── MULTIPLE_CHOICE answer ───────────────────────────────────────────────
    // Stored as comma-separated selected letters, e.g. "A,C"
    @Column(name = "selected_options")
    private String selectedOptions;

    // ── SHORT_ANSWER answer ──────────────────────────────────────────────────
    @Column(name = "written_answer", columnDefinition = "TEXT")
    private String writtenAnswer;

    // ── Evaluation result ────────────────────────────────────────────────────
    // null  = not yet evaluated (SHORT_ANSWER pending manual grading)
    // true  = correct / full marks
    // false = incorrect / no marks
    private Boolean isCorrect;
}
