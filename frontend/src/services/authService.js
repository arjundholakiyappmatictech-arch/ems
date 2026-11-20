import api from '@/lib/api/api';

/**
 * Tier 5 Authentication Service
 * Communicates with Laravel backend endpoints conforming to the strict 2-verb REST model.
 * Always propagates AbortSignal and unwraps ADR-001 response envelope.
 */

/**
 * Log in with email and password.
 * @param {{ email: string, password: string }} payload
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function login(payload, signal) {
  const response = await api.post('/auth/login', payload, { signal });
  return response.data?.data;
}

/**
 * Invalidate Sanctum Bearer token on backend.
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>}
 */
export async function logout(signal) {
  const response = await api.post('/auth/logout', {}, { signal });
  return response.data?.data;
}

/**
 * Fetch currently authenticated user identity.
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>}
 */
export async function getMe(signal) {
  const response = await api.get('/auth/me', { signal });
  return response.data?.data;
}

