/**
 * Simple date comparison utilities using ISO string format
 * Since timestamps are stored in ISO format, we can compare date parts directly
 */

/**
 * Get the date part of an ISO timestamp (YYYY-MM-DD)
 */
export function getDatePart(isoTimestamp: string): string {
  return isoTimestamp.substring(0, 10);
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  return new Date().toISOString().substring(0, 10);
}

/**
 * Get date string for a specific date in YYYY-MM-DD format
 */
export function getDateString(date: Date): string {
  return date.toISOString().substring(0, 10);
}

/**
 * Check if two ISO timestamps are on the same date
 */
export function isSameDate(timestamp1: string, timestamp2: string): boolean {
  return getDatePart(timestamp1) === getDatePart(timestamp2);
}

/**
 * Check if an ISO timestamp is for today
 */
export function isToday(timestamp: string): boolean {
  return getDatePart(timestamp) === getTodayDateString();
}

/**
 * Check if an ISO timestamp is for a specific date
 */
export function isDate(timestamp: string, date: Date): boolean {
  return getDatePart(timestamp) === getDateString(date);
}

/**
 * Filter log values for a specific date
 */
export function getLogValuesForDate(
  logValues: Array<{ timestamp: string }>,
  date: Date
) {
  const targetDate = getDateString(date);
  return logValues.filter((log) => getDatePart(log.timestamp) === targetDate);
}

/**
 * Check if there's any log for a specific date
 */
export function hasLogForDate(
  logValues: Array<{ timestamp: string }>,
  date: Date
): boolean {
  return getLogValuesForDate(logValues, date).length > 0;
}
