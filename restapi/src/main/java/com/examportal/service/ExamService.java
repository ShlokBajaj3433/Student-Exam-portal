package com.examportal.service;

import com.examportal.dto.request.AssignQuestionsRequest;
import com.examportal.dto.request.CreateExamRequest;
import com.examportal.dto.request.UpdateExamRequest;
import com.examportal.dto.response.ExamResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Interface for exam management operations.
 * Covers the full CRUD lifecycle, question assignment, and status transitions
 * (DRAFT → PUBLISHED → CLOSED).
 */
public interface ExamService {

    /**
     * Creates a new exam in DRAFT status, linked to the given admin.
     *
     * @param request    exam creation request
     * @param adminEmail email of the creating admin
     * @return the created exam
     */
    ExamResponse createExam(CreateExamRequest request, String adminEmail);

    /**
     * Updates an existing exam. Only DRAFT exams may be updated.
     *
     * @param examId  ID of the exam to update
     * @param request fields to update (all optional)
     * @return the updated exam
     */
    ExamResponse updateExam(Long examId, UpdateExamRequest request);

    /**
     * Deletes an exam and all its exam_questions mappings.
     *
     * @param examId ID of the exam to delete
     */
    void deleteExam(Long examId);

    /**
     * Returns a single exam by ID.
     *
     * @param examId ID of the exam
     * @return the exam
     * @throws com.examportal.exception.ResourceNotFoundException if not found
     */
    ExamResponse getExam(Long examId);

    /**
     * Returns a paginated list of all exams (admin view — all statuses).
     *
     * @param pageable pagination parameters
     * @return page of exams
     */
    Page<ExamResponse> getAllExams(Pageable pageable);

    /**
     * Transitions an exam from DRAFT to PUBLISHED.
     * Requires at least one question to be assigned.
     *
     * @param examId ID of the exam to publish
     * @return the updated exam
     */
    ExamResponse publishExam(Long examId);

    /**
     * Transitions an exam from PUBLISHED to CLOSED.
     *
     * @param examId ID of the exam to close
     * @return the updated exam
     */
    ExamResponse closeExam(Long examId);

    /**
     * Assigns a list of questions to a DRAFT exam.
     *
     * @param examId      ID of the target exam (must be DRAFT)
     * @param questionIds list of question IDs to assign
     * @return the updated exam
     */
    ExamResponse assignQuestions(Long examId, List<Long> questionIds);
}
