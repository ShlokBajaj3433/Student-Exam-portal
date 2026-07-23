import api from './api';

// ── Student profile ───────────────────────────────────────────────────────────

export const getStudentProfile = () =>
  api.get('/api/student/profile');

export const updateStudentProfile = (data) =>
  api.put('/api/student/profile', data);

// ── Admin profile ─────────────────────────────────────────────────────────────

export const getAdminProfile = () =>
  api.get('/api/admin/profile');

export const updateAdminProfile = (data) =>
  api.put('/api/admin/profile', data);
