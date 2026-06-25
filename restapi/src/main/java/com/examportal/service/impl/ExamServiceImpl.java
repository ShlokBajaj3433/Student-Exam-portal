package com.examportal.service.impl;

import com.examportal.dto.request.CreateExamRequest;
import com.examportal.dto.request.UpdateExamRequest;
import com.examportal.dto.response.ExamResponse;
import com.examportal.entity.Exam;
import com.examportal.entity.Question;
import com.examportal.entity.User;
import com.examportal.enums.ExamStatus;
import com.examportal.exception.ExamNotAvailableException;
import com.examportal.exception.ResourceNotFoundException;
import com.examportal.repository.ExamRepository;
import com.examportal.repository.QuestionRepository;
import com.examportal.repository.UserRepository;
import com.examportal.service.ExamService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Service implementation for exam management operations.
 * Handles CRUD, status lifecycle transitions, and question assignment.
 */
@Service
@Transactional
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;

    public ExamServiceImpl(ExamRepository examRepository,
                           QuestionRepository questionRepository,
                           UserRepository userRepository) {
        this.examRepository = examRepository;
        this.questionRepository = questionRepository;
        this.userRepository = userRepository;
    }

    /**
     * Creates a new exam in DRAFT status.
     *
     * Preconditions:
     *   - request fields pass Bean Validation
     *   - if both startTime and endTime are provided, endTime > startTime (cross-field rule)
     * Postconditions:
     *   - exam is persisted with status = DRAFT
     *   - createdBy is linked to the admin user
     */
    @Override
    public ExamResponse createExam(CreateExamRequest request, String adminEmail) {
        validateTimeRange(request.startTime(), request.endTime());

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", -1L));

        Exam exam = new Exam();
        exam.setTitle(request.title());
        exam.setDescription(request.description());
        exam.setDurationMinutes(request.durationMinutes());
        exam.setTotalMarks(request.totalMarks());
        exam.setStartTime(request.startTime());
        exam.setEndTime(request.endTime());
        exam.setStatus(ExamStatus.DRAFT);
        exam.setCreatedBy(admin);

        return ExamResponse.from(examRepository.save(exam));
    }

    /**
     * Updates an existing DRAFT exam.
     *
     * Preconditions:
     *   - exam with examId exists
     *   - exam status is DRAFT
     *   - cross-field time rule holds if both times are provided
     * Postconditions:
     *   - only non-null fields from request are applied
     */
    @Override
    public ExamResponse updateExam(Long examId, UpdateExamRequest request) {
        Exam exam = fetchExamOrThrow(examId);

        if (exam.getStatus() != ExamStatus.DRAFT) {
            throw new ExamNotAvailableException(
                    "Exam '" + exam.getTitle() + "' can only be updated while in DRAFT status.");
        }

        // Compute the effective startTime and endTime after any partial update
        java.time.LocalDateTime effectiveStart =
                request.startTime() != null ? request.startTime() : exam.getStartTime();
        java.time.LocalDateTime effectiveEnd =
                request.endTime() != null ? request.endTime() : exam.getEndTime();
        validateTimeRange(effectiveStart, effectiveEnd);

        if (request.title() != null) {
            exam.setTitle(request.title());
        }
        if (request.description() != null) {
            exam.setDescription(request.description());
        }
        if (request.durationMinutes() != null) {
            exam.setDurationMinutes(request.durationMinutes());
        }
        if (request.totalMarks() != null) {
            exam.setTotalMarks(request.totalMarks());
        }
        if (request.startTime() != null) {
            exam.setStartTime(request.startTime());
        }
        if (request.endTime() != null) {
            exam.setEndTime(request.endTime());
        }

        return ExamResponse.from(examRepository.save(exam));
    }

    /**
     * Deletes an exam and all its exam_questions mappings.
     * The ManyToMany relationship is cleared first to remove join-table rows,
     * then the exam record is deleted.
     *
     */
    @Override
    public void deleteExam(Long examId) {
        Exam exam = fetchExamOrThrow(examId);
        // Clear the join table entries before deletion
        exam.getQuestions().clear();
        examRepository.save(exam);
        examRepository.delete(exam);
    }

    /**
     * Returns a single exam by ID.
     *
     */
    @Override
    @Transactional(readOnly = true)
    public ExamResponse getExam(Long examId) {
        return ExamResponse.from(fetchExamOrThrow(examId));
    }

    /**
     * Returns a paginated list of all exams (all statuses — admin view).
     *
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ExamResponse> getAllExams(Pageable pageable) {
        return examRepository.findAll(pageable).map(ExamResponse::from);
    }

    /**
     * Transitions an exam from DRAFT to PUBLISHED.
     *
     * Preconditions:
     *   - exam exists and is in DRAFT status
     *   - at least one question is assigned to the exam
     * Postconditions:
     *   - exam.status == PUBLISHED
     *
     */
    @Override
    public ExamResponse publishExam(Long examId) {
        Exam exam = fetchExamOrThrow(examId);

        if (exam.getStatus() != ExamStatus.DRAFT) {
            throw new ExamNotAvailableException(
                    "Only DRAFT exams can be published. Current status: " + exam.getStatus());
        }
        if (exam.getQuestions() == null || exam.getQuestions().isEmpty()) {
            throw new ExamNotAvailableException(
                    "Cannot publish exam '" + exam.getTitle() + "': no questions are assigned.");
        }

        exam.setStatus(ExamStatus.PUBLISHED);
        return ExamResponse.from(examRepository.save(exam));
    }

    /**
     * Transitions an exam from PUBLISHED to CLOSED.
     *
     * Preconditions:
     *   - exam exists and is in PUBLISHED status
     * Postconditions:
     *   - exam.status == CLOSED
     *
     */
    @Override
    public ExamResponse closeExam(Long examId) {
        Exam exam = fetchExamOrThrow(examId);

        if (exam.getStatus() != ExamStatus.PUBLISHED) {
            throw new ExamNotAvailableException(
                    "Only PUBLISHED exams can be closed. Current status: " + exam.getStatus());
        }

        exam.setStatus(ExamStatus.CLOSED);
        return ExamResponse.from(examRepository.save(exam));
    }

    /**
     * Assigns questions to a DRAFT exam.
     * Existing question assignments are replaced with the provided list.
     *
     * Preconditions:
     *   - exam exists and is in DRAFT status
     *   - all questionIds refer to existing questions
     * Postconditions:
     *   - exam.questions contains exactly the requested questions
     *
     */
    @Override
    public ExamResponse assignQuestions(Long examId, List<Long> questionIds) {
        Exam exam = fetchExamOrThrow(examId);

        if (exam.getStatus() != ExamStatus.DRAFT) {
            throw new ExamNotAvailableException(
                    "Questions can only be assigned to DRAFT exams. Current status: " + exam.getStatus());
        }

        List<Question> questions = new ArrayList<>();
        for (Long questionId : questionIds) {
            Question q = questionRepository.findById(questionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Question", questionId));
            questions.add(q);
        }

        exam.setQuestions(questions);
        return ExamResponse.from(examRepository.save(exam));
    }

    // Private helpers

    /**
     * Fetches an exam by ID or throws ResourceNotFoundException.
     */
    private Exam fetchExamOrThrow(Long examId) {
        return examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", examId));
    }

    /**
     * Validates that endTime is strictly after startTime when both are provided.
     *
     * @param startTime the start time (may be null)
     * @param endTime   the end time (may be null)
     * @throws ExamNotAvailableException if endTime is not after startTime
     */
    private void validateTimeRange(java.time.LocalDateTime startTime, java.time.LocalDateTime endTime) {
        if (startTime != null && endTime != null && !endTime.isAfter(startTime)) {
            throw new ExamNotAvailableException(
                    "Exam end time must be strictly after the start time.");
        }
    }
}
