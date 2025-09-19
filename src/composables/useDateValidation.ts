import { computed } from "vue";
import type { LogValue } from "@/types";
import { isDate } from "@/helpers/dateUtils";

export function useDateValidation(logValues: LogValue[], selectedDate?: Date) {
  // Determine the target date for logging (selected date or today)
  const targetDate = computed((): Date => {
    return selectedDate || new Date();
  });

  // Check if there's already a log for the target date
  const hasLogForTargetDate = computed((): boolean => {
    if (!logValues || logValues.length === 0) {
      return false;
    }

    return logValues.some((log: LogValue) =>
      isDate(log.timestamp, targetDate.value)
    );
  });

  return {
    targetDate,
    hasLogForTargetDate,
  };
}
