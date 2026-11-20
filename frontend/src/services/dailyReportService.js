import api from '@/lib/api/api';

/**
 * Tier 5 Daily Work Report Service
 * Strict 2-verb REST model. ADR-001 response envelope unwrapping.
 */

/**
 * Fetch daily work reports list.
 * @param {object} [filters={}]
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array<object>>}
 */
export async function getDailyReports(filters = {}, signal) {
  const response = await api.get('/daily-reports', { params: filters, signal });
  return response.data?.data ?? [];
}

/**
 * Fetch single daily report by ID.
 * @param {number|string} id
 * @param {AbortSignal} [signal]
 * @returns {Promise<object|null>}
 */
export async function getDailyReport(id, signal) {
  const response = await api.get(`/daily-reports/${id}`, { signal });
  return response.data?.data ?? null;
}

/**
 * Create a new daily work report for today.
 * @param {object} payload
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>}
 */
export async function createDailyReport(payload, signal) {
  const response = await api.post('/daily-reports/store', payload, { signal });
  return response.data?.data;
}

/**
 * Update an existing daily work report.
 * @param {number|string} id
 * @param {object} payload
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>}
 */
export async function updateDailyReport(id, payload, signal) {
  const response = await api.post(`/daily-reports/${id}/update`, payload, { signal });
  return response.data?.data;
}

/**
 * Submit manager review/remarks for a daily report (Manager only).
 * @param {number|string} id
 * @param {{ review_remarks: string }} payload
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>}
 */
export async function reviewDailyReport(id, payload, signal) {
  const response = await api.post(`/daily-reports/${id}/review`, payload, { signal });
  return response.data?.data;
}

