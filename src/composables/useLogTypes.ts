import { computed } from "vue";
import { useLogsStore } from "@/stores/Logs";
import { useSettingsStore } from "@/stores/Settings";
import type { LogType } from "@/types";
import { NO_CATEGORY } from "@/constants";

export type CategoryGroup = {
  categoryName: string;
  items: LogType[];
};

export function useLogTypes() {
  const logsStore = useLogsStore();
  const settingsStore = useSettingsStore();

  const showArchived = computed(() => settingsStore.settings.showArchived);
  const changeOrder = computed(() => settingsStore.changeOrder);

  // Enhanced log types with category info, last value and time ago
  const sortedLogTypes = computed<LogType[]>(() => {
    // Filter items based on showArchived setting
    const filteredLogTypes = showArchived.value
      ? logsStore.logTypes.filter((logType) => logType.archived) // Show only archived when ON
      : logsStore.logTypes.filter((logType) => !logType.archived); // Show only active when OFF

    // Sort by name
    return filteredLogTypes.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  });

  // Grouped log types by category
  const groupedLogTypes = computed<CategoryGroup[]>(() => {
    const groups: { [categoryName: string]: LogType[] } = {};

    sortedLogTypes.value.forEach((logType) => {
      const categoryName = logType.category
        ? logsStore.getCategory(logType.category)?.name || NO_CATEGORY
        : NO_CATEGORY;
      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      groups[categoryName].push(logType);
    });

    // Convert to array and sort categories by name, with "No Category" last
    return Object.entries(groups)
      .sort(([a], [b]) => {
        if (a === NO_CATEGORY) return 1;
        if (b === NO_CATEGORY) return -1;
        return a.localeCompare(b);
      })
      .map(([categoryName, items]) => ({
        categoryName,
        items: items.sort((a, b) => {
          if (changeOrder.value) {
            // Treat undefined as infinity (items without order go to the end)
            const aOrder = a.order ?? Number.MAX_SAFE_INTEGER;
            const bOrder = b.order ?? Number.MAX_SAFE_INTEGER;
            const orderDiff = aOrder - bOrder;
            if (orderDiff !== 0) return orderDiff;
          }
          // Default: sort by name
          return a.name.localeCompare(b.name);
        }),
      }));
  });

  // Navigation functions for log types
  const getLogTypeByOffset = (
    currentLogTypeName: string,
    offset: number
  ): LogType | null => {
    const sortedTypes = sortedLogTypes.value;
    const currentIndex = sortedTypes.findIndex(
      (logType) => logType.name === currentLogTypeName
    );
    if (currentIndex === -1) return null;

    const targetIndex = currentIndex + offset;
    if (targetIndex < 0 || targetIndex >= sortedTypes.length) return null;

    return sortedTypes[targetIndex];
  };

  const getNextLogType = (currentLogTypeName: string): LogType | null =>
    getLogTypeByOffset(currentLogTypeName, 1);

  const getPreviousLogType = (currentLogTypeName: string): LogType | null =>
    getLogTypeByOffset(currentLogTypeName, -1);

  return {
    sortedLogTypes,
    groupedLogTypes,
    getNextLogType,
    getPreviousLogType,
  };
}
