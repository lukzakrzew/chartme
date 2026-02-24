/**
 * Simple date comparison utilities using ISO string format
 * Since timestamps are stored in ISO format, we can compare date parts directly
 */

/**
 * Get the date part of an ISO timestamp (YYYY-MM-DD)
 * @deprecated Use getDateString for local date comparison instead
 */
export function getDatePart(isoTimestamp: string): string {
  return isoTimestamp.substring(0, 10);
}

/**
 * Get today's date in 'Fri Feb 14 2025' format (local time)
 */
export function getTodayDateString(): string {
  return new Date().toDateString();
}

/**
 * Get date string for a specific date in 'Fri Feb 14 2025' format (local time)
 */
export function getDateString(date: Date): string {
  return date.toDateString();
}

/**
 * Check if two ISO timestamps are on the same date (using local time)
 */
export function isSameDate(timestamp1: string, timestamp2: string): boolean {
  return new Date(timestamp1).toDateString() === new Date(timestamp2).toDateString();
}

/**
 * Check if an ISO timestamp is for today (using local time)
 */
export function isToday(timestamp: string): boolean {
  return new Date(timestamp).toDateString() === new Date().toDateString();
}

/**
 * Check if an ISO timestamp is for a specific date (using local time)
 */
export function isDate(timestamp: string, date: Date): boolean {
  return new Date(timestamp).toDateString() === date.toDateString();
}

/**
 * Filter log values for a specific date (using local time)
 */
export function getLogValuesForDate(
  logValues: Array<{ timestamp: string }>,
  date: Date
) {
  const targetDateStr = date.toDateString();
  return logValues.filter((log) => new Date(log.timestamp).toDateString() === targetDateStr);
}

/**
 * Check if there's any log for a specific date (using local time)
 */
export function hasLogForDate(
  logValues: Array<{ timestamp: string }>,
  date: Date
): boolean {
  return getLogValuesForDate(logValues, date).length > 0;
}
