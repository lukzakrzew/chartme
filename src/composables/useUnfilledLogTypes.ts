import { computed } from "vue";
import type { LogType } from "@/types";
import { useLogsStore } from "@/stores/Logs";

export function isLogTypeFilledRecently(logType: LogType): boolean {
  // If no aggregates or no lastTime, it needs filling
  if (!logType.aggrs?.lastTime) {
    return false; // No logs at all, needs filling
  }

  const now = new Date();
  const lastLogDate = new Date(logType.aggrs.lastTime);

  // For frequency=1 (daily), check if last log was today (calendar day)
  if (logType.frequency === 1) {
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // If last log was today, it's filled; otherwise needs filling
    return lastLogDate >= today && lastLogDate < tomorrow;
  }

  // For other frequencies, use the sliding window approach
  const daysSinceLastLog = Math.floor(
    (now.getTime() - lastLogDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // If days since last log exceed frequency, it needs filling
  return daysSinceLastLog <= logType.frequency;
}

/**
 * Composable for getting unfilled log types
 * @param categoryName - Optional category name to filter by
 * @returns Object with unfilledLogTypes computed property
 *
 * Note: Automatically excludes archived log types and considers frequency
 */
export function useUnfilledLogTypes(categoryName?: string) {
  const logsStore = useLogsStore();

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
