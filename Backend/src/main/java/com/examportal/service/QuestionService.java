package com.examportal.service;

import com.examportal.dto.request.CreateQuestionRequest;
import com.examportal.dto.request.UpdateQuestionRequest;
import com.examportal.dto.response.AdminQuestionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Interface for question bank management operations.
 */
public interface QuestionService {

    AdminQuestionResponse createQuestion(CreateQuestionRequest request, String adminEmail);

    AdminQuestionResponse updateQuestion(Long questionId, UpdateQuestionRequest request);

    void deleteQuestion(Long questionId);

    AdminQuestionResponse getQuestion(Long questionId);

    Page<AdminQuestionResponse> getAllQuestions(Pageable pageable);
}
