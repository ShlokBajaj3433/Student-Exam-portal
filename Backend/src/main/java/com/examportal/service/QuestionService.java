package com.examportal.service;

import com.examportal.dto.request.CreateQuestionRequest;
import com.examportal.dto.request.UpdateQuestionRequest;
import com.examportal.dto.response.QuestionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Interface for question bank management operations.
 * Covers full CRUD for questions with guards against unsafe deletion.
 */
public interface QuestionService {

    /**
     * Creates a new question in the question bank, linked to the given admin.
     *
     * @param request    question creation request (validated by caller)
     * @param adminEmail email of the creating admin
     * @return the created question
     */
    QuestionResponse createQuestion(CreateQuestionRequest request, String adminEmail);

    /**
     * Updates an existing question. Only provided (non-null) fields are changed.
     *
     * @param questionId ID of the question to update
     * @param request    fields to update (all optional)
     * @return the updated question
     * @throws com.examportal.exception.ResourceNotFoundException if question not found
     */
    QuestionResponse updateQuestion(Long questionId, UpdateQuestionRequest request);

    /**
     * Deletes a question from the question bank.
     * Deletion is blocked if the question is currently assigned to a PUBLISHED exam.
     *
     * @param questionId ID of the question to delete
     * @throws com.examportal.exception.ResourceNotFoundException if question not found
     * @throws com.examportal.exception.ExamNotAvailableException if question is in a PUBLISHED exam
     */
    void deleteQuestion(Long questionId);

    /**
     * Returns a single question by ID.
     *
     * @param questionId ID of the question
     * @return the question response
     * @throws com.examportal.exception.ResourceNotFoundException if question not found
     */
    QuestionResponse getQuestion(Long questionId);

    /**
     * Returns a paginated list of all questions.
     *
     * @param pageable pagination and sort parameters
     * @return page of question responses
     */
    Page<QuestionResponse> getAllQuestions(Pageable pageable);
}
