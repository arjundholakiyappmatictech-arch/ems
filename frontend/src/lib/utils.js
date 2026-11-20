import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a time string (e.g. "09:30:00" or ISO string) into 12-hour format ("9:30 AM").
 */
export function formatTime12h(timeStr) {
  if (!timeStr) return '—';
  if (typeof timeStr === 'string' && timeStr.includes('T')) {
    const d = new Date(timeStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
  }
  const parts = String(timeStr).split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    if (isNaN(hours)) return timeStr;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }
  return timeStr;
}

/**
 * Safely parse clock_in time string and date string into a Date object.
 */
export function parseAttendanceDateTime(clockInStr, dateStr) {
  if (!clockInStr) return null;
  if (typeof clockInStr === 'string' && (clockInStr.includes('T') || clockInStr.includes('-'))) {
    const d = new Date(clockInStr);
    return isNaN(d.getTime()) ? null : d;
  }
  const date = dateStr || new Date().toISOString().slice(0, 10);
  const d = new Date(`${date}T${clockInStr}`);
  return isNaN(d.getTime()) ? null : d;
}

