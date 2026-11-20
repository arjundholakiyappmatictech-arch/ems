/**
 * Maps Laravel 422 validation error bags directly into React Hook Form field errors.
 * Complies with Section 3.D in GUIDELINES.md.
 *
 * @param {Record<string, string[]|string>} laravelErrors - The error dictionary from ADR-001 payload
 * @param {Function} setError - React Hook Form setError method
 */
export function mapLaravelErrorsToForm(laravelErrors, setError) {
  if (!laravelErrors || typeof setError !== 'function') return;

  Object.entries(laravelErrors).forEach(([field, messages]) => {
    const message = Array.isArray(messages) ? messages[0] : String(messages);
    setError(field, { type: 'server', message });
  });
}

