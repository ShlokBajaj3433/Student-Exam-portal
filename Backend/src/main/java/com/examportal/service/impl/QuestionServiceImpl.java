package com.examportal.service.impl;

import com.examportal.dto.request.CreateQuestionRequest;
import com.examportal.dto.request.UpdateQuestionRequest;
import com.examportal.dto.response.AdminQuestionResponse;
import com.examportal.entity.Question;
import com.examportal.entity.User;
import com.examportal.enums.QuestionType;
import com.examportal.exception.ExamNotAvailableException;
import com.examportal.exception.ResourceNotFoundException;
import com.examportal.repository.ExamRepository;
import com.examportal.repository.QuestionRepository;
import com.examportal.repository.UserRepository;
import com.examportal.service.QuestionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class QuestionServiceImpl implements QuestionService {

    private final QuestionRepository questionRepository;
    private final ExamRepository examRepository;
    private final UserRepository userRepository;

    public QuestionServiceImpl(QuestionRepository questionRepository,
                               ExamRepository examRepository,
                               UserRepository userRepository) {
        this.questionRepository = questionRepository;
        this.examRepository = examRepository;
        this.userRepository = userRepository;
    }

    @Override
    public AdminQuestionResponse createQuestion(CreateQuestionRequest req, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", -1L));

        validateForType(req.questionType(), req.optionA(), req.optionB(), req.optionC(), req.optionD(),
                req.correctAnswer(), req.correctAnswers(), req.modelAnswer());

        Question q = new Question();
        q.setQuestionType(req.questionType());
        q.setQuestionText(req.questionText());
        q.setMarks(req.marks());
        q.setDifficulty(req.difficulty());
        q.setCreatedBy(admin);
        applyTypeFields(q, req.questionType(), req.optionA(), req.optionB(), req.optionC(), req.optionD(),
                req.correctAnswerChar(), req.correctAnswers(), req.modelAnswer());

        return AdminQuestionResponse.from(questionRepository.save(q));
    }

    @Override
    public AdminQuestionResponse updateQuestion(Long questionId, UpdateQuestionRequest req) {
        Question q = fetchOrThrow(questionId);

        QuestionType newType = req.questionType() != null ? req.questionType() : q.getQuestionType();

        if (req.questionText() != null)  q.setQuestionText(req.questionText());
        if (req.marks() != null)         q.setMarks(req.marks());
        if (req.difficulty() != null)    q.setDifficulty(req.difficulty());
        if (req.questionType() != null)  q.setQuestionType(req.questionType());

        // Apply option / answer fields if any of them are supplied
        boolean anyAnswerField = req.optionA() != null || req.optionB() != null ||
                req.optionC() != null || req.optionD() != null ||
                req.correctAnswer() != null || req.correctAnswers() != null ||
                req.modelAnswer() != null;

        if (anyAnswerField) {
            String oA = req.optionA() != null ? req.optionA() : q.getOptionA();
            String oB = req.optionB() != null ? req.optionB() : q.getOptionB();
            String oC = req.optionC() != null ? req.optionC() : q.getOptionC();
            String oD = req.optionD() != null ? req.optionD() : q.getOptionD();
            String ca  = req.correctAnswer() != null ? req.correctAnswer() : (q.getCorrectAnswer() != null ? String.valueOf(q.getCorrectAnswer()) : null);
            String cas = req.correctAnswers() != null ? req.correctAnswers() : q.getCorrectAnswers();
            String ma  = req.modelAnswer() != null ? req.modelAnswer() : q.getModelAnswer();
            validateForType(newType, oA, oB, oC, oD, ca, cas, ma);
            applyTypeFields(q, newType, oA, oB, oC, oD,
                    ca != null && !ca.isBlank() ? ca.charAt(0) : null, cas, ma);
        }

        return AdminQuestionResponse.from(questionRepository.save(q));
    }

    @Override
    public void deleteQuestion(Long questionId) {
        Question q = fetchOrThrow(questionId);
        if (examRepository.existsPublishedExamContaining(q)) {
            throw new ExamNotAvailableException(
                    "Question " + questionId + " is assigned to a PUBLISHED exam and cannot be deleted.");
        }
        questionRepository.delete(q);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminQuestionResponse getQuestion(Long questionId) {
        return AdminQuestionResponse.from(fetchOrThrow(questionId));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminQuestionResponse> getAllQuestions(Pageable pageable) {
        return questionRepository.findAll(pageable).map(AdminQuestionResponse::from);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Question fetchOrThrow(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question", id));
    }

    /**
     * Cross-field validation per question type.
     */
    private void validateForType(QuestionType type,
                                  String oA, String oB, String oC, String oD,
                                  String correctAnswer, String correctAnswers, String modelAnswer) {
        switch (type) {
            case MCQ -> {
                if (isBlank(oA) || isBlank(oB) || isBlank(oC) || isBlank(oD))
                    throw new IllegalArgumentException("MCQ questions require all four options (A, B, C, D).");
                if (isBlank(correctAnswer))
                    throw new IllegalArgumentException("MCQ questions require a correctAnswer (A, B, C, or D).");
            }
            case MULTIPLE_CHOICE -> {
                if (isBlank(oA) || isBlank(oB) || isBlank(oC) || isBlank(oD))
                    throw new IllegalArgumentException("MULTIPLE_CHOICE questions require all four options.");
                if (isBlank(correctAnswers))
                    throw new IllegalArgumentException("MULTIPLE_CHOICE questions require correctAnswers (e.g. 'A,C').");
                // Validate each letter
                for (String part : correctAnswers.split(",")) {
                    String letter = part.trim().toUpperCase();
                    if (!letter.matches("[ABCD]"))
                        throw new IllegalArgumentException(
                                "correctAnswers must contain only A, B, C, or D separated by commas. Got: " + part);
                }
            }
            case SHORT_ANSWER -> {
                if (isBlank(modelAnswer))
                    throw new IllegalArgumentException("SHORT_ANSWER questions require a modelAnswer.");
            }
        }
    }

    /** Sets type-specific fields on the entity and clears fields from other types. */
    private void applyTypeFields(Question q, QuestionType type,
                                  String oA, String oB, String oC, String oD,
                                  Character correctAnswer, String correctAnswers, String modelAnswer) {
        switch (type) {
            case MCQ -> {
                q.setOptionA(oA);
                q.setOptionB(oB);
                q.setOptionC(oC);
                q.setOptionD(oD);
                q.setCorrectAnswer(correctAnswer);
                q.setCorrectAnswers(null);
                q.setModelAnswer(null);
            }
            case MULTIPLE_CHOICE -> {
                q.setOptionA(oA);
                q.setOptionB(oB);
                q.setOptionC(oC);
                q.setOptionD(oD);
                q.setCorrectAnswer(null);
                // Normalize: sort letters and deduplicate, e.g. "B,A,C" → "A,B,C"
                String normalized = normalizeCorrectAnswers(correctAnswers);
                q.setCorrectAnswers(normalized);
                q.setModelAnswer(null);
            }
            case SHORT_ANSWER -> {
                q.setOptionA(null);
                q.setOptionB(null);
                q.setOptionC(null);
                q.setOptionD(null);
                q.setCorrectAnswer(null);
                q.setCorrectAnswers(null);
                q.setModelAnswer(modelAnswer);
            }
        }
    }

    private String normalizeCorrectAnswers(String raw) {
        if (raw == null) return null;
        return java.util.Arrays.stream(raw.split(","))
                .map(String::trim)
                .map(String::toUpperCase)
                .distinct()
                .sorted()
                .collect(java.util.stream.Collectors.joining(","));
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
