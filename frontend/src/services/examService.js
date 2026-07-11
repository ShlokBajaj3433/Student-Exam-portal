import api from './api';

/**
 * examService — wraps all /api/exams endpoints
 */

export function getExams(page = 0, size = 10) {
  return api.get('/api/exams', { params: { page, size } });
}

export function createExam(data) {
  return api.post('/api/exams', data);
}

export function updateExam(id, data) {
  return api.put(`/api/exams/${id}`, data);
}

export function deleteExam(id) {
  return api.delete(`/api/exams/${id}`);
}

export function publishExam(id) {
  return api.post(`/api/exams/${id}/publish`);
}

export function assignQuestions(examId, questionIds) {
  return api.post(`/api/exams/${examId}/questions`, { questionIds });
}
