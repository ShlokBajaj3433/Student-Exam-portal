import api from './api';

/**
 * adminService — wraps admin-only endpoints (users, analytics, results)
 */

export function getUsers(page = 0, size = 10) {
  return api.get('/api/admin/users', { params: { page, size } });
}

export function deleteUser(id) {
  return api.delete(`/api/admin/users/${id}`);
}

export function getAnalytics() {
  return api.get('/api/admin/analytics');
}

export function getResults(page = 0, size = 10) {
  return api.get('/api/admin/results', { params: { page, size } });
}
