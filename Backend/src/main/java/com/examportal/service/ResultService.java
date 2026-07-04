package com.examportal.service;

import com.examportal.dto.response.ResultResponse;
import com.examportal.entity.ExamAttempt;
import com.examportal.entity.StudentAnswer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ResultService {

    /**
     * Evaluates and persists a Result for the given attempt and answers.
     */
    ResultResponse evaluate(ExamAttempt attempt, List<StudentAnswer> answers);

    /**
     * Returns the result for the given attempt. Throws UnauthorizedAccessException (403)
     * if callerEmail does not match the attempt owner. Throws ResourceNotFoundException (404)
     * if no result exists.
     */
    ResultResponse getResult(Long attemptId, String callerEmail);

    /**
     * Admin-only: returns all results paginated.
     */
    Page<ResultResponse> getAllResults(Pageable pageable);

    /**
     * Admin-only: returns results for a specific exam, paginated.
     */
    Page<ResultResponse> getResultsByExam(Long examId, Pageable pageable);
}
