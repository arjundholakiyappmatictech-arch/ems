import api from '@/lib/api/api';

/**
 * Tier 5 Designation Service
 * Strict 2-verb REST model (GET and POST only).
 * Unwraps ADR-001 response envelope.
 */

export async function getDesignations(filters = {}, signal) {
  const response = await api.get('/designations', { params: filters, signal });
  const raw = response.data?.data;
  return Array.isArray(raw) ? raw : (raw?.data ?? []);
}

export async function getDesignation(id, signal) {
  const response = await api.get(`/designations/${id}`, { signal });
  return response.data?.data ?? null;
}

export async function createDesignation(payload, signal) {
  const response = await api.post('/designations/store', payload, { signal });
  return response.data?.data;
}

export async function updateDesignation(id, payload, signal) {
  const response = await api.post(`/designations/${id}/update`, payload, { signal });
  return response.data?.data;
}

export async function destroyDesignation(id, signal) {
  const response = await api.post(`/designations/${id}/destroy`, {}, { signal });
  return response.data?.data;
}

