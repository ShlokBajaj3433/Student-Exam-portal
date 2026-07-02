package com.examportal.service;

import com.examportal.dto.request.AnswerDto;
import com.examportal.dto.request.SubmitExamRequest;
import com.examportal.dto.response.AttemptSummaryResponse;
import com.examportal.dto.response.ExamAttemptResponse;
import com.examportal.dto.response.ResultResponse;

import java.util.List;

/**
 * Service interface for managing exam attempt lifecycle:
 * start, in-progress answer saving, manual submission, and auto-timeout.
 *
 * Requirements: 9.1–9.5, 10.1–10.4, 12.1–12.4
 */
public interface ExamAttemptService {

    /**
     * Starts a new exam attempt for the authenticated student.
     *
     * <p>Preconditions:
     * <ul>
     *   <li>The student identified by {@code studentEmail} exists and is enabled.</li>
     *   <li>The exam identified by {@code examId} exists and has status PUBLISHED.</li>
     *   <li>The current time is within [exam.startTime, exam.endTime].</li>
     *   <li>No IN_PROGRESS attempt exists for the (student, exam) pair.</li>
     * </ul>
     *
     * <p>Postconditions:
     * <ul>
     *   <li>A new ExamAttempt is persisted with status = IN_PROGRESS and startTime = now().</li>
     *   <li>Returns an ExamAttemptResponse with attempt details and shuffled question list
     *       (without correct answers).</li>
     * </ul>
     *
     * @param examId      ID of the exam to start
     * @param studentEmail JWT subject (email) of the authenticated student
     * @return attempt response containing attempt ID, exam metadata, and questions
     * @throws com.examportal.exception.ResourceNotFoundException  if student or exam not found
     * @throws com.examportal.exception.ExamNotAvailableException  if exam is not PUBLISHED or outside window
     * @throws com.examportal.exception.DuplicateAttemptException  if an IN_PROGRESS attempt already exists
     *
     * Requirements: 9.1–9.5
     */
    ExamAttemptResponse startExam(Long examId, String studentEmail);

    /**
     * Saves (upserts) a single answer for an in-progress exam attempt.
     *
     * <p>Preconditions:
     * <ul>
     *   <li>The attempt identified by {@code attemptId} exists and belongs to
     *       the student identified by {@code studentEmail}.</li>
     *   <li>The attempt status is IN_PROGRESS.</li>
     *   <li>{@code answerDto.selectedOption} is null or one of {A, B, C, D}.</li>
     * </ul>
     *
     * <p>Postconditions:
     * <ul>
     *   <li>If no StudentAnswer record exists for (attempt, question), one is created.</li>
     *   <li>If a StudentAnswer record already exists, its selectedOption is updated.</li>
     * </ul>
     *
     * @param attemptId   ID of the in-progress attempt
     * @param answerDto   the answer (questionId + selectedOption)
     * @param studentEmail JWT subject of the authenticated student (for ownership check)
     * @throws com.examportal.exception.ResourceNotFoundException  if attempt or question not found
     * @throws com.examportal.exception.ExamNotAvailableException  if attempt is not IN_PROGRESS
     * @throws com.examportal.exception.UnauthorizedAccessException if student does not own the attempt
     *
     * Requirements: 10.1–10.4
     */
    void saveAnswer(Long attemptId, AnswerDto answerDto, String studentEmail);

    /**
     * Submits an in-progress exam attempt, evaluates all answers, and returns the result.
     *
     * <p>Preconditions:
     * <ul>
     *   <li>The attempt identified by {@code request.attemptId} exists.</li>
     *   <li>The JWT subject ({@code callerEmail}) matches the attempt's student email.</li>
     *   <li>The attempt status is IN_PROGRESS.</li>
     * </ul>
     *
     * <p>Postconditions:
     * <ul>
     *   <li>attempt.submitTime == now(), attempt.attemptStatus == SUBMITTED.</li>
     *   <li>StudentAnswer records are persisted with {@code isCorrect} flags set.</li>
     *   <li>A Result record is created via ResultService.evaluate and returned.</li>
     * </ul>
     *
     * @param request     submission payload containing attemptId and list of answers
     * @param callerEmail JWT subject of the authenticated student
     * @return result response with score, percentage, grade, and pass/fail
     * @throws com.examportal.exception.ResourceNotFoundException   if attempt or question not found (404)
     * @throws com.examportal.exception.UnauthorizedAccessException if caller does not own the attempt (403)
     * @throws com.examportal.exception.ExamNotAvailableException   if attempt is not IN_PROGRESS (409)
     *
     * Requirements: 11.1–11.9
     */
    ResultResponse submitExam(SubmitExamRequest request, String callerEmail);

    /**
     * Returns a list of all past attempt summaries for the authenticated student.
     *
     * @param studentEmail JWT subject of the authenticated student
     * @return list of attempt summaries (exam title, date, score, status)
     *
     * Requirements: 13.4
     */
    List<AttemptSummaryResponse> getAttemptHistory(String studentEmail);

    /**
     * Scheduled task: detects and auto-submits exam attempts that have exceeded
     * their time limit. Called by the Spring {@code @Scheduled} infrastructure.
     *
     * <p>Postconditions:
     * <ul>
     *   <li>All IN_PROGRESS attempts past their deadline are set to TIMED_OUT.</li>
     *   <li>A Result record is evaluated and persisted for each auto-submitted attempt.</li>
     * </ul>
     *
     * Requirements: 12.1–12.4
     */
    void handleTimedOutAttempts();
}
