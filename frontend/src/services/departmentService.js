import api from '@/lib/api/api';

/**
 * Tier 5 Department Service
 * Strict 2-verb REST model (GET and POST only).
 * Unwraps ADR-001 response envelope.
 */

export async function getDepartments(signal) {
  const response = await api.get('/departments', { signal });
  const raw = response.data?.data;
  return Array.isArray(raw) ? raw : (raw?.data ?? []);
}

export async function getDepartment(id, signal) {
  const response = await api.get(`/departments/${id}`, { signal });
  return response.data?.data ?? null;
}

export async function createDepartment(payload, signal) {
  const response = await api.post('/departments/store', payload, { signal });
  return response.data?.data;
}

export async function updateDepartment(id, payload, signal) {
  const response = await api.post(`/departments/${id}/update`, payload, { signal });
  return response.data?.data;
}

export async function destroyDepartment(id, signal) {
  const response = await api.post(`/departments/${id}/destroy`, {}, { signal });
  return response.data?.data;
}

