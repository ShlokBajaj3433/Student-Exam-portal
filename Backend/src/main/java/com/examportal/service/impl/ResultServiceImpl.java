package com.examportal.service.impl;

import com.examportal.dto.response.ResultResponse;
import com.examportal.entity.ExamAttempt;
import com.examportal.entity.Result;
import com.examportal.entity.StudentAnswer;
import com.examportal.exception.ResourceNotFoundException;
import com.examportal.exception.UnauthorizedAccessException;
import com.examportal.repository.ExamAttemptRepository;
import com.examportal.repository.ResultRepository;
import com.examportal.service.GradeCalculator;
import com.examportal.service.ResultService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Service implementation for result evaluation and retrieval.
 */
@Service
public class ResultServiceImpl implements ResultService {

    private final ResultRepository resultRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final GradeCalculator gradeCalculator;

    public ResultServiceImpl(ResultRepository resultRepository,
                             ExamAttemptRepository examAttemptRepository,
                             GradeCalculator gradeCalculator) {
        this.resultRepository = resultRepository;
        this.examAttemptRepository = examAttemptRepository;
        this.gradeCalculator = gradeCalculator;
    }

    /**
     * Evaluates the answers for an attempt, persists a Result, and returns
     * the result as a response DTO.
     *
     * <p>Only answers where {@code isCorrect == true} contribute marks.
     * Unanswered questions contribute 0 marks.
     */
    @Override
    @Transactional
    public ResultResponse evaluate(ExamAttempt attempt, List<StudentAnswer> answers) {
        // Sum marks for all correct answers
        int score = answers.stream()
                .filter(a -> Boolean.TRUE.equals(a.getIsCorrect()))
                .mapToInt(a -> a.getQuestion().getMarks())
                .sum();

        int totalMarks = attempt.getExam().getTotalMarks();

        BigDecimal percentage = BigDecimal.valueOf((long) score * 100)
                .divide(BigDecimal.valueOf(totalMarks), 2, RoundingMode.HALF_UP);

        String grade = gradeCalculator.calculateGrade(percentage);
        boolean passed = gradeCalculator.isPassed(percentage);

        // Reflect score back onto the attempt
        attempt.setScore(score);
        examAttemptRepository.save(attempt);

        // Build and persist the Result entity
        Result result = new Result();
        result.setAttempt(attempt);
        result.setScore(score);
        result.setPercentage(percentage);
        result.setGrade(grade);
        result.setPassed(passed);
        result.setEvaluatedAt(LocalDateTime.now());

        Result saved = resultRepository.save(result);
        return ResultResponse.from(saved);
    }

    /**
     * Returns the result for the given attempt.
     *
     * @throws ResourceNotFoundException   if the attempt or result does not exist (404)
     * @throws UnauthorizedAccessException if callerEmail does not match the attempt owner (403)
     */
    @Override
    @Transactional(readOnly = true)
    public ResultResponse getResult(Long attemptId, String callerEmail) {
        ExamAttempt attempt = examAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("ExamAttempt", attemptId));

        if (!attempt.getStudent().getUser().getEmail().equals(callerEmail)) {
            throw new UnauthorizedAccessException("You are not authorized to view this result.");
        }

        Result result = resultRepository.findByAttempt(attempt)
                .orElseThrow(() -> new ResourceNotFoundException("Result for attempt", attemptId));

        return ResultResponse.from(result);
    }

    /**
     * Admin-only: returns all results paginated.
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ResultResponse> getAllResults(Pageable pageable) {
        return resultRepository.findAll(pageable).map(ResultResponse::from);
    }

    /**
     * Admin-only: returns results for a specific exam, paginated.

     */
    @Override
    @Transactional(readOnly = true)
    public Page<ResultResponse> getResultsByExam(Long examId, Pageable pageable) {
        return resultRepository.findByExamId(examId, pageable).map(ResultResponse::from);
    }
}
