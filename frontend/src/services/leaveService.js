import api from '@/lib/api/api';

/**
 * Tier 5 Leave Management Service
 * Strict 2-verb REST model. ADR-001 envelope unwrapping.
 */

/**
 * Fetch available leave types and policy quotas.
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array<object>>}
 */
export async function getLeaveTypes(signal) {
  const response = await api.get('/leave-types', { signal });
  const raw = response.data?.data;
  return Array.isArray(raw) ? raw : (raw?.data ?? []);
}

/**
 * Fetch leave requests (scoped to user or all for managers).
 * @param {object} [filters={}]
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array<object>>}
 */
export async function getLeaveRequests(filters = {}, signal) {
  const response = await api.get('/leave-requests', { params: filters, signal });
  const raw = response.data?.data;
  return Array.isArray(raw) ? raw : (raw?.data ?? []);
}

/**
 * Submit a new leave request.
 * @param {object} payload
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>}
 */
export async function createLeaveRequest(payload, signal) {
  const response = await api.post('/leave-requests/store', payload, { signal });
  return response.data?.data;
}

/**
 * Approve a pending leave request (Manager only).
 * @param {number|string} id
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>}
 */
export async function approveLeaveRequest(id, signal) {
  const response = await api.post(`/leave-requests/${id}/approve`, {}, { signal });
  return response.data?.data;
}

/**
 * Reject a pending leave request (Manager only).
 * @param {number|string} id
 * @param {{ action_reason: string }} payload
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>}
 */
export async function rejectLeaveRequest(id, payload, signal) {
  const response = await api.post(`/leave-requests/${id}/reject`, payload, { signal });
  return response.data?.data;
}

/**
 * Cancel a pending leave request (Employee owner).
 * @param {number|string} id
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>}
 */
export async function cancelLeaveRequest(id, signal) {
  const response = await api.post(`/leave-requests/${id}/cancel`, {}, { signal });
  return response.data?.data;
}

