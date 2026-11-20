import api from '@/lib/api/api';

/**
 * Tier 5 Attendance Service
 * Communicates with Laravel attendance endpoints following strict 2-verb model.
 * All mutations are POST requests with ADR-001 response unwrapping.
 */

/**
 * Retrieve attendance history with optional filters (e.g., date, employee_id, status).
 * @param {object} [filters={}]
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array<object>>}
 */
export async function getAttendances(filters = {}, signal) {
  const response = await api.get('/attendances', { params: filters, signal });
  return response.data?.data ?? [];
}

/**
 * Retrieve today's punch record for the authenticated user.
 * @param {AbortSignal} [signal]
 * @returns {Promise<object|null>}
 */
export async function getTodayAttendance(signal) {
  const response = await api.get('/attendances/today', { signal });
  return response.data?.data ?? null;
}

/**
 * Punch in for today's shift.
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>}
 */
export async function clockIn(signal) {
  const response = await api.post('/attendances/clock-in', {}, { signal });
  return response.data?.data;
}

/**
 * Punch out for today's shift.
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>}
 */
export async function clockOut(signal) {
  const response = await api.post('/attendances/clock-out', {}, { signal });
  return response.data?.data;
}

