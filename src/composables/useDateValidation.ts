import { computed, type Ref } from "vue";
import type { LogValue } from "@/types";
import { isDate } from "@/helpers/dateUtils";

export function useDateValidation(
  logValues: Ref<LogValue[]>,
  selectedDate?: Ref<Date | undefined>
) {
  // Determine the target date for logging (selected date or today)
  const targetDate = computed((): Date => {
    return selectedDate?.value || new Date();
  });

  // Check if there's already a log for the target date
  const hasLogForTargetDate = computed((): boolean => {
    if (!logValues.value || logValues.value.length === 0) {
      return false;
    }

    return logValues.value.some((log: LogValue) =>
      isDate(log.timestamp, targetDate.value)
    );
  });

  return {
    targetDate,
    hasLogForTargetDate,
  };
}
