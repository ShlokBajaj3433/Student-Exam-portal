package com.examportal.service.impl;

import com.examportal.dto.request.CreateQuestionRequest;
import com.examportal.dto.request.UpdateQuestionRequest;
import com.examportal.dto.response.QuestionResponse;
import com.examportal.entity.Question;
import com.examportal.entity.User;
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

/**
 * Service implementation for question bank management.
 *
 * Handles creation, update, retrieval, and deletion of questions.
 * Deletion is guarded: a question assigned to a PUBLISHED exam cannot be removed
 * to preserve exam integrity.
 */
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

    /**
     * Creates a new question in the question bank.
     *
     * Preconditions:
     *   request fields pass Bean Validation (validated at controller boundary)
     *   correctAnswer ∈ {A, B, C, D} (enforced by @Pattern on the DTO)
     *   adminEmail corresponds to an existing enabled user
     
     * Postconditions:
     *   question is persisted with all provided fields
     *   createdBy is linked to the admin user
     */
    @Override
    public QuestionResponse createQuestion(CreateQuestionRequest request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", -1L));

        Question question = new Question();
        question.setQuestionText(request.questionText());
        question.setOptionA(request.optionA());
        question.setOptionB(request.optionB());
        question.setOptionC(request.optionC());
        question.setOptionD(request.optionD());
        question.setCorrectAnswer(request.correctAnswerChar());
        question.setMarks(request.marks());
        question.setDifficulty(request.difficulty());
        question.setCreatedBy(admin);

        return QuestionResponse.from(questionRepository.save(question));
    }

    /**
     * Updates an existing question. Only non-null fields in the request are applied.
     *
     * Preconditions:
    
     *   question with questionId exists
     *   if correctAnswer is provided it must satisfy @Pattern([ABCD]) — validated at boundary
     
     * Postconditions:
    
     *   only provided fields are changed; absent fields retain their previous values
     
     */
    @Override
    public QuestionResponse updateQuestion(Long questionId, UpdateQuestionRequest request) {
        Question question = fetchQuestionOrThrow(questionId);

        if (request.questionText() != null) {
            question.setQuestionText(request.questionText());
        }
        if (request.optionA() != null) {
            question.setOptionA(request.optionA());
        }
        if (request.optionB() != null) {
            question.setOptionB(request.optionB());
        }
        if (request.optionC() != null) {
            question.setOptionC(request.optionC());
        }
        if (request.optionD() != null) {
            question.setOptionD(request.optionD());
        }
        if (request.correctAnswerChar() != null) {
            question.setCorrectAnswer(request.correctAnswerChar());
        }
        if (request.marks() != null) {
            question.setMarks(request.marks());
        }
        if (request.difficulty() != null) {
            question.setDifficulty(request.difficulty());
        }

        return QuestionResponse.from(questionRepository.save(question));
    }

    /**
     * Deletes a question from the question bank.
     *
     * Preconditions:
    
     *   question with questionId exists
     *   question is NOT assigned to any PUBLISHED exam
     
     * Postconditions:
    
     *   question record is removed from the database
     
     *
     * @throws ExamNotAvailableException (→ 409) if assigned to a PUBLISHED exam
     */
    @Override
    public void deleteQuestion(Long questionId) {
        Question question = fetchQuestionOrThrow(questionId);

        if (examRepository.existsPublishedExamContaining(question)) {
            throw new ExamNotAvailableException(
                    "Question " + questionId + " is assigned to a PUBLISHED exam and cannot be deleted.");
        }

        questionRepository.delete(question);
    }

    /**
     * Returns a single question by ID.
     */
    @Override
    @Transactional(readOnly = true)
    public QuestionResponse getQuestion(Long questionId) {
        return QuestionResponse.from(fetchQuestionOrThrow(questionId));
    }

    /**
     * Returns a paginated list of all questions.
     */
    @Override
    @Transactional(readOnly = true)
    public Page<QuestionResponse> getAllQuestions(Pageable pageable) {
        return questionRepository.findAll(pageable).map(QuestionResponse::from);
    }

    // ---- Private helpers ------------------------------------------------

    private Question fetchQuestionOrThrow(Long questionId) {
        return questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question", questionId));
    }
}
