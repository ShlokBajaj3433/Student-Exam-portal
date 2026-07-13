import api from './api';

/**
 * questionService — wraps all /api/questions endpoints
 */

export function getQuestions(page = 0, size = 12) {
  return api.get('/api/questions', { params: { page, size } });
}

export function getQuestionById(id) {
  return api.get(`/api/questions/${id}`);
}

export function createQuestion(data) {
  return api.post('/api/questions', data);
}

export function updateQuestion(id, data) {
  return api.put(`/api/questions/${id}`, data);
}

export function deleteQuestion(id) {
  return api.delete(`/api/questions/${id}`);
}
