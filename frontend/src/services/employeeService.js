import api from '@/lib/api/api';

/**
 * Tier 5 Employee Service
 * Follows strict 2-verb REST model (GET and POST only).
 * Unwraps Laravel ADR-001 response envelopes and forwards AbortSignal.
 */

/**
 * Fetch paginated or filtered list of employees.
 * @param {object} [filters={}]
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array<object>>}
 */
export async function getEmployees(filters = {}, signal) {
  const response = await api.get('/employees', { params: filters, signal });
  const raw = response.data?.data;
  return Array.isArray(raw) ? raw : (raw?.data ?? []);
}

/**
 * Fetch a single employee by ID.
 * @param {number|string} id
 * @param {AbortSignal} [signal]
 * @returns {Promise<object|null>}
 */
export async function getEmployee(id, signal) {
  const response = await api.get(`/employees/${id}`, { signal });
  return response.data?.data ?? null;
}

/**
 * Atomically create a new employee profile and user credentials (Manager only).
 * @param {object} payload
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>}
 */
export async function createEmployee(payload, signal) {
  const response = await api.post('/employees/store', payload, { signal });
  return response.data?.data;
}

/**
 * Update an existing employee profile.
 * @param {number|string} id
 * @param {object} payload
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>}
 */
export async function updateEmployee(id, payload, signal) {
  const response = await api.post(`/employees/${id}/update`, payload, { signal });
  return response.data?.data;
}

/**
 * Toggle or update employee status (active / inactive / suspended).
 * @param {number|string} id
 * @param {{ status: string }} payload
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>}
 */
export async function updateEmployeeStatus(id, payload, signal) {
  const response = await api.post(`/employees/${id}/status`, payload, { signal });
  return response.data?.data;
}

/**
 * Soft delete an employee record.
 * @param {number|string} id
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>}
 */
export async function destroyEmployee(id, signal) {
  const response = await api.post(`/employees/${id}/destroy`, {}, { signal });
  return response.data?.data;
}

