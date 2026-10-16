import api from './api';

/**
 * studentService — wraps all /api/student endpoints
 */

/** List all PUBLISHED exams in the active time window */
export function getAvailableExams(page = 0, size = 20) {
  return api.get('/api/student/exams', { params: { page, size } });
}

/** Start an exam attempt; returns ExamAttemptResponse */
export function startExam(examId) {
  return api.post('/api/student/startExam', null, { params: { examId } });
}

/**
 * Save a single answer immediately.
 * selectedOption is 'A' | 'B' | 'C' | 'D' | null
 */
export function saveAnswer(attemptId, questionId, selectedOption) {
  return api.patch('/api/student/answer', { attemptId, questionId, selectedOption });
}

/** Submit the exam and receive a ResultResponse */
export function submitExam(attemptId) {
  return api.post('/api/student/submitExam', { attemptId });
}

/** Fetch a single result by attempt ID */
export function getResult(attemptId) {
  return api.get(`/api/student/result/${attemptId}`);
}

/** Fetch the authenticated student's full attempt history */
export function getAttemptHistory() {
  return api.get('/api/student/attempts');
}
