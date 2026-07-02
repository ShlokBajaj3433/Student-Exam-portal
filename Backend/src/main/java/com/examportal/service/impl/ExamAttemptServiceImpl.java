package com.examportal.service.impl;

import com.examportal.dto.request.AnswerDto;
import com.examportal.dto.request.SubmitExamRequest;
import com.examportal.dto.response.AttemptSummaryResponse;
import com.examportal.dto.response.ExamAttemptResponse;
import com.examportal.dto.response.ResultResponse;
import com.examportal.entity.*;
import com.examportal.enums.AttemptStatus;
import com.examportal.enums.ExamStatus;
import com.examportal.exception.DuplicateAttemptException;
import com.examportal.exception.ExamNotAvailableException;
import com.examportal.exception.ResourceNotFoundException;
import com.examportal.exception.UnauthorizedAccessException;
import com.examportal.repository.*;
import com.examportal.service.ExamAttemptService;
import com.examportal.service.ResultService;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Service implementation for the exam attempt lifecycle:
 * starting an attempt, saving answers in-progress, and scheduled auto-timeout.
 *
 * Requirements: 9.1–9.5, 10.1–10.4, 12.1–12.4
 */
@Service
@Transactional
public class ExamAttemptServiceImpl implements ExamAttemptService {

    private final ExamAttemptRepository attemptRepository;
    private final StudentRepository studentRepository;
    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final StudentAnswerRepository studentAnswerRepository;
    private final ResultService resultService;

    public ExamAttemptServiceImpl(ExamAttemptRepository attemptRepository,
                                  StudentRepository studentRepository,
                                  ExamRepository examRepository,
                                  QuestionRepository questionRepository,
                                  StudentAnswerRepository studentAnswerRepository,
                                  ResultService resultService) {
        this.attemptRepository = attemptRepository;
        this.studentRepository = studentRepository;
        this.examRepository = examRepository;
        this.questionRepository = questionRepository;
        this.studentAnswerRepository = studentAnswerRepository;
        this.resultService = resultService;
    }

    /**
     * Starts a new exam attempt for the authenticated student.
     *
     * <p>Flow:
     * <ol>
     *   <li>Resolve the Student record from the JWT subject (email).</li>
     *   <li>Load the Exam or throw 404.</li>
     *   <li>Validate exam is PUBLISHED and current time is within [startTime, endTime].</li>
     *   <li>Guard against duplicate IN_PROGRESS attempts for the same (student, exam).</li>
     *   <li>Persist a new ExamAttempt with status = IN_PROGRESS and startTime = now().</li>
     *   <li>Return ExamAttemptResponse with shuffled question list (correct answers omitted).</li>
     * </ol>
     *
     * Preconditions:
     *   - studentEmail resolves to an existing, enabled user with a Student profile
     *   - examId refers to an existing exam
     *
     * Postconditions:
     *   - attempt.status == IN_PROGRESS, attempt.startTime == now()
     *   - deadline == attempt.startTime + exam.durationMinutes
     *
     * Requirements: 9.1–9.5
     */
    @Override
    public ExamAttemptResponse startExam(Long examId, String studentEmail) {
        // Resolve student from JWT subject
        Student student = studentRepository.findByUser_Email(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student (email=" + studentEmail + ")", -1L));

        // Load exam or throw 404
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", examId));

        // Validate exam is PUBLISHED (Requirement 9.2)
        if (exam.getStatus() != ExamStatus.PUBLISHED) {
            throw new ExamNotAvailableException(
                    "Exam '" + exam.getTitle() + "' is not available for attempts. " +
                    "Current status: " + exam.getStatus());
        }

        // Validate current time is within [startTime, endTime] (Requirement 9.3)
        LocalDateTime now = LocalDateTime.now();
        validateExamTimeWindow(exam, now);

        // Guard against duplicate IN_PROGRESS attempt (Requirement 9.4)
        attemptRepository.findByStudentAndExamAndAttemptStatus(
                student, exam, AttemptStatus.IN_PROGRESS)
                .ifPresent(existing -> {
                    throw new DuplicateAttemptException(
                            "You already have an active attempt for exam '" + exam.getTitle() +
                            "'. Attempt ID: " + existing.getAttemptId());
                });

        // Create and persist the attempt (Requirement 9.1)
        ExamAttempt attempt = new ExamAttempt();
        attempt.setStudent(student);
        attempt.setExam(exam);
        attempt.setStartTime(now);
        attempt.setAttemptStatus(AttemptStatus.IN_PROGRESS);

        ExamAttempt saved = attemptRepository.save(attempt);

        // Shuffle question order per attempt to reduce cheating opportunities
        List<Question> questions = new ArrayList<>(exam.getQuestions());
        Collections.shuffle(questions);

        // Return response — QuestionResponse.from() intentionally omits correctAnswer (Requirement 18.6)
        return ExamAttemptResponse.from(saved, questions);
    }

    /**
     * Submits an in-progress exam attempt, evaluates all answers, and returns the result.
     *
     * <p>Flow:
     * <ol>
     *   <li>Load the attempt or throw 404.</li>
     *   <li>Verify ownership via JWT subject — throw 403 if mismatch.</li>
     *   <li>Verify attempt is IN_PROGRESS — throw 409 if already SUBMITTED or TIMED_OUT.</li>
     *   <li>For each AnswerDto: persist a StudentAnswer with isCorrect flag evaluated against
     *       the question's correctAnswer. Previously saved (in-progress) answers are overridden
     *       by the answers supplied in the submit request.</li>
     *   <li>Set submitTime = now(), status = SUBMITTED, persist.</li>
     *   <li>Delegate to ResultService.evaluate and return the ResultResponse.</li>
     * </ol>
     *
     * Requirements: 11.1–11.9
     */
    @Override
    public ResultResponse submitExam(SubmitExamRequest request, String callerEmail) {
        // 1. Fetch attempt or 404
        ExamAttempt attempt = attemptRepository.findById(request.attemptId())
                .orElseThrow(() -> new ResourceNotFoundException("ExamAttempt", request.attemptId()));

        // 2. Ownership verification — JWT subject must match attempt's student (Requirement 11.2, 18.8)
        String ownerEmail = attempt.getStudent().getUser().getEmail();
        if (!ownerEmail.equals(callerEmail)) {
            throw new UnauthorizedAccessException(
                    "You are not authorized to submit attempt ID: " + request.attemptId());
        }

        // 3. Verify attempt is IN_PROGRESS → 409 if SUBMITTED or TIMED_OUT (Requirement 11.3)
        if (attempt.getAttemptStatus() != AttemptStatus.IN_PROGRESS) {
            throw new ExamNotAvailableException(
                    "This attempt cannot be submitted. Current status: " + attempt.getAttemptStatus());
        }

        // 4. Build and persist StudentAnswer records with isCorrect flags (Requirement 11.4)
        //    The submit request's answers override any in-progress saves for the same question.
        List<StudentAnswer> studentAnswers = new ArrayList<>();
        for (AnswerDto answerDto : request.answers()) {
            Question question = questionRepository.findById(answerDto.questionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Question", answerDto.questionId()));

            // Upsert: reuse existing record if present (to avoid duplicate rows)
            StudentAnswer sa = studentAnswerRepository
                    .findByAttemptAndQuestion(attempt, question)
                    .orElseGet(() -> {
                        StudentAnswer newSa = new StudentAnswer();
                        newSa.setAttempt(attempt);
                        newSa.setQuestion(question);
                        return newSa;
                    });

            Character selectedOption = answerDto.selectedOptionChar();
            sa.setSelectedOption(selectedOption);

            // isCorrect: true iff selectedOption is non-null AND matches correctAnswer (Requirement 11.4, Property 13)
            sa.setIsCorrect(
                    selectedOption != null &&
                    selectedOption.equals(question.getCorrectAnswer())
            );

            studentAnswers.add(sa);
        }
        studentAnswerRepository.saveAll(studentAnswers);

        // 5. Mark attempt as SUBMITTED (Requirements 11.1, 11.9)
        attempt.setSubmitTime(LocalDateTime.now());
        attempt.setAttemptStatus(AttemptStatus.SUBMITTED);
        attemptRepository.save(attempt);

        // 6. Evaluate and return the result (Requirements 11.5–11.8)
        return resultService.evaluate(attempt, studentAnswers);
    }

    /**
     * Upserts a single answer for an in-progress exam attempt.
     *
     * <p>If no StudentAnswer record exists for the (attempt, question) pair, one is created.
     * If a record already exists, its selectedOption is updated.
     *
     * <p>Validates:
     * <ul>
     *   <li>Attempt exists and is owned by the caller.</li>
     *   <li>Attempt status is IN_PROGRESS → 409 otherwise.</li>
     *   <li>selectedOption is null or in {A,B,C,D} (enforced by Bean Validation on DTO,
     *       double-checked here for service-layer integrity).</li>
     * </ul>
     *
     * Requirements: 10.1–10.4
     */
    @Override
    public void saveAnswer(Long attemptId, AnswerDto answerDto, String studentEmail) {
        // Load attempt or 404
        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("ExamAttempt", attemptId));

        // Ownership check (Requirement 18.8)
        String attemptOwnerEmail = attempt.getStudent().getUser().getEmail();
        if (!attemptOwnerEmail.equals(studentEmail)) {
            throw new UnauthorizedAccessException(
                    "You are not authorized to save answers for attempt ID: " + attemptId);
        }

        // Attempt must be IN_PROGRESS → 409 otherwise (Requirement 10.4)
        if (attempt.getAttemptStatus() != AttemptStatus.IN_PROGRESS) {
            throw new ExamNotAvailableException(
                    "Answers can only be saved for IN_PROGRESS attempts. " +
                    "Current status: " + attempt.getAttemptStatus());
        }

        // Load question or 404
        Question question = questionRepository.findById(answerDto.questionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question", answerDto.questionId()));

        // Validate selectedOption is null or one of {A, B, C, D} (Requirement 10.2)
        Character selectedOption = answerDto.selectedOptionChar();
        if (selectedOption != null) {
            char opt = Character.toUpperCase(selectedOption);
            if (opt != 'A' && opt != 'B' && opt != 'C' && opt != 'D') {
                throw new IllegalArgumentException(
                        "selectedOption must be one of A, B, C, D or null (to skip). Got: " + selectedOption);
            }
            selectedOption = opt;
        }

        // Upsert: update if exists, insert if not (Requirement 10.3)
        final Character finalOption = selectedOption;
        StudentAnswer studentAnswer = studentAnswerRepository
                .findByAttemptAndQuestion(attempt, question)
                .orElseGet(() -> {
                    StudentAnswer sa = new StudentAnswer();
                    sa.setAttempt(attempt);
                    sa.setQuestion(question);
                    return sa;
                });

        studentAnswer.setSelectedOption(finalOption);
        // isCorrect is not evaluated here — it is set during submission/auto-timeout
        // to keep answer saving lightweight (Requirement 10.1)
        studentAnswer.setIsCorrect(null);

        studentAnswerRepository.save(studentAnswer);
    }

    /**
     * Returns all past attempt summaries for the authenticated student.
     *
     * Requirements: 13.4
     */
    @Override
    @Transactional(readOnly = true)
    public List<AttemptSummaryResponse> getAttemptHistory(String studentEmail) {
        Student student = studentRepository.findByUser_Email(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student (email=" + studentEmail + ")", -1L));

        return attemptRepository
                .findByStudent(student, PageRequest.of(0, Integer.MAX_VALUE))
                .stream()
                .map(AttemptSummaryResponse::from)
                .toList();
    }

    /**
     * Scheduled task: auto-submits timed-out in-progress exam attempts.
     *
     * Runs every 60 seconds. For each IN_PROGRESS attempt whose
     * (startTime + durationMinutes) is before now(), sets status to TIMED_OUT,
     * records the submitTime, and (when ResultService is available) evaluates
     * the answers collected so far — unanswered questions contribute 0 marks.
     *
     * Preconditions (per attempt processed):
     *   - attempt.status == IN_PROGRESS
     *   - now() > attempt.startTime + exam.durationMinutes
     *
     * Postconditions:
     *   - attempt.status == TIMED_OUT
     *   - attempt.submitTime == processing time
     *
     * Requirements: 12.1–12.4
     */
    @Override
    @Scheduled(fixedDelay = 60_000)
    public void handleTimedOutAttempts() {
        LocalDateTime now = LocalDateTime.now();

        // Fetch all in-progress attempts and filter those past their deadline in Java,
        // since JPQL cannot subtract an interval using a per-row column value portably.
        List<ExamAttempt> candidates = attemptRepository.findAllInProgress();

        for (ExamAttempt attempt : candidates) {
            LocalDateTime deadline = attempt.getStartTime()
                    .plusMinutes(attempt.getExam().getDurationMinutes());

            if (now.isAfter(deadline)) {
                attempt.setAttemptStatus(AttemptStatus.TIMED_OUT);
                attempt.setSubmitTime(now);
                attemptRepository.save(attempt);
                resultService.evaluate(attempt, attempt.getAnswers());
            }
        }
    }

    // ─── Private helpers ───────────────────────────────────────────────────────

    /**
     * Validates that the current time is within the exam's start/end window.
     * If exam.startTime or exam.endTime are null the check is skipped for that bound.
     *
     * @throws ExamNotAvailableException if outside window
     */
    private void validateExamTimeWindow(Exam exam, LocalDateTime now) {
        if (exam.getStartTime() != null && now.isBefore(exam.getStartTime())) {
            throw new ExamNotAvailableException(
                    "Exam '" + exam.getTitle() + "' has not started yet. " +
                    "Start time: " + exam.getStartTime());
        }
        if (exam.getEndTime() != null && now.isAfter(exam.getEndTime())) {
            throw new ExamNotAvailableException(
                    "Exam '" + exam.getTitle() + "' has already ended. " +
                    "End time: " + exam.getEndTime());
        }
    }
}
