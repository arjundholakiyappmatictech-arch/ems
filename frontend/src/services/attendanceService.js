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
  const raw = response.data?.data;
  return Array.isArray(raw) ? raw : (raw?.data ?? []);
}

/**
 * Retrieve today's punch record for the authenticated user.
 * @param {AbortSignal} [signal]
 * @returns {Promise<object|null>}
 */
export async function getTodayAttendance(signal) {
  const response = await api.get('/attendances/today', { signal });
  const raw = response.data?.data;
  if (!raw) return null;

  // Backend returns: { is_clocked_in, is_clocked_out, attendance }
  if (raw.attendance !== undefined) {
    if (!raw.attendance) {
      return {
        is_clocked_in: false,
        is_clocked_out: false,
        clock_in: null,
        clock_out: null,
        total_hours: null,
      };
    }
    return {
      is_clocked_in: raw.is_clocked_in,
      is_clocked_out: raw.is_clocked_out,
      ...raw.attendance,
    };
  }

  return raw;
}

/**
 * Punch in for today's shift.
 * @param {object} [payload={}]
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>}
 */
export async function clockIn(payload = {}, signal) {
  const response = await api.post('/attendances/clock-in', payload, { signal });
  return response.data?.data;
}

/**
 * Punch out for today's shift.
 * @param {object} [payload={}]
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>}
 */
export async function clockOut(payload = {}, signal) {
  const response = await api.post('/attendances/clock-out', payload, { signal });
  return response.data?.data;
}
