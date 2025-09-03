import { computed } from "vue";
import type { LogType, LogValue } from "@/types";
import { useLogsStore } from "@/stores/Logs";

/**
 * Composable for getting unfilled log types
 * @param categoryName - Optional category name to filter by
 * @returns Object with unfilledLogTypes computed property
 *
 * Note: Automatically excludes archived log types and considers frequency
 */
export function useUnfilledLogTypes(categoryName?: string) {
  const logsStore = useLogsStore();

  // Helper function to check if a log type has been filled recently (based on frequency)
  const isLogTypeFilledRecently = (logType: LogType): boolean => {
    const logValues = logsStore.getLogValues(logType.name).value;

    if (!logValues || logValues.length === 0) {
      return false; // No logs at all, needs filling
    }

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Calculate the period based on frequency (frequency days back from today)
    const periodStart = new Date(today);
    periodStart.setDate(today.getDate() - (logType.frequency - 1));

    // Check if there are any logs within the frequency period
    const hasLogInPeriod = logValues.some((log: LogValue) => {
      const logDate = new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0); // Normalize to start of day
      return logDate >= periodStart && logDate <= today;
    });

    return hasLogInPeriod;
  };

  // Get all log types that haven't been filled recently (based on frequency, filtered by category if specified)
  const unfilledLogTypes = computed((): LogType[] => {
    return logsStore.logTypes.filter((logType) => {
      // Skip archived log types - we don't want to fill them in
      if (logType.archived) {
        return false;
      }

      // Filter by category if categoryName is provided
      if (categoryName && logType.category !== categoryName) {
        return false;
      }

      return !isLogTypeFilledRecently(logType);
    });
  });

  return {
    unfilledLogTypes,
    isLogTypeFilledRecently,
  };
}
