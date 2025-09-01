import type { LogType, LogValue, Category } from "@/types";
import store from "store2";
import { defineStore } from "pinia";
import { ref, type Ref } from "vue";

// Import test data
import { logTypes as testLogTypes } from "@/testData/logTypes";
import { logsPushups } from "@/testData/logs-pushups";
import { logsPullups } from "@/testData/logs-pullups";

export const LocalStorageKeys = {
  logTypes: "logTypes",
  categories: "categories",
  logsPrefix: "logs-",
} as const;

export const useLogsStore = defineStore("logs", () => {
  const logTypes = ref<LogType[]>(store.get(LocalStorageKeys.logTypes) || []);
  const categories = ref<Category[]>(
    store.get(LocalStorageKeys.categories) || []
  );
  const logValuesRefs = new Map<string, Ref<LogValue[]>>();

  function addLogType(logType: LogType) {
    logTypes.value.push(logType);
    store.set(LocalStorageKeys.logTypes, logTypes.value);
  }

  function getLogType(name: string) {
    return logTypes.value.find((lt) => lt.name === name);
  }

  function addCategory(category: Category) {
    categories.value.push(category);
    store.set(LocalStorageKeys.categories, categories.value);
  }

  function getCategory(name: string) {
    return categories.value.find((c) => c.name === name);
  }

  function updateCategory(oldName: string, updatedCategory: Category) {
    const index = categories.value.findIndex((c) => c.name === oldName);
    if (index !== -1) {
      categories.value[index] = updatedCategory;
      store.set(LocalStorageKeys.categories, categories.value);
    }
  }

  function getLogValues(name: string): Ref<LogValue[]> {
    if (!logValuesRefs.has(name)) {
      // Initialize ref with data from localStorage
      const storedValues =
        store.get(`${LocalStorageKeys.logsPrefix}${name}`) || [];
      logValuesRefs.set(name, ref<LogValue[]>(storedValues));
    }
    return logValuesRefs.get(name)!;
  }

  function addLogValue(name: string, value: LogValue) {
    const logValuesRef = getLogValues(name);

    // Update the reactive ref
    logValuesRef.value.push(value);

    // Save to localStorage
    store.set(`${LocalStorageKeys.logsPrefix}${name}`, logValuesRef.value);

    // Recalculate aggregates for this log type
    recalculateAggregates(name);
  }

  // Calculate aggregates for a specific log type
  function recalculateAggregates(logTypeName: string) {
    const logTypeIndex = logTypes.value.findIndex(
      (lt) => lt.name === logTypeName
    );
    if (logTypeIndex === -1) return;

    const logValues = getLogValues(logTypeName).value;
    if (logValues.length === 0) return;

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Get last log timestamp and value
    const lastLog = logValues[logValues.length - 1];
    const lastTime = lastLog.timestamp;
    const lastValue = lastLog.value;

    // Filter values by time periods (only for number values, skip boolean)
    const allValues = logValues
      .filter((lv) => typeof lv.value === "number")
      .map((lv) => lv.value as number);
    const weekValues = logValues
      .filter((lv) => {
        const logDate = new Date(lv.timestamp);
        return logDate >= oneWeekAgo && typeof lv.value === "number";
      })
      .map((lv) => lv.value as number);

    const monthValues = logValues
      .filter((lv) => {
        const logDate = new Date(lv.timestamp);
        return logDate >= oneMonthAgo && typeof lv.value === "number";
      })
      .map((lv) => lv.value as number);

    const threeMonthValues = logValues
      .filter((lv) => {
        const logDate = new Date(lv.timestamp);
        return logDate >= threeMonthsAgo && typeof lv.value === "number";
      })
      .map((lv) => lv.value as number);

    // Calculate averages
    const weekAvg =
      weekValues.length > 0
        ? weekValues.reduce((sum, val) => sum + val, 0) / weekValues.length
        : undefined;
    const monthAvg =
      monthValues.length > 0
        ? monthValues.reduce((sum, val) => sum + val, 0) / monthValues.length
        : undefined;
    const threeMonthAvg =
      threeMonthValues.length > 0
        ? threeMonthValues.reduce((sum, val) => sum + val, 0) /
          threeMonthValues.length
        : undefined;
    const totalAvg =
      allValues.length > 0
        ? allValues.reduce((sum, val) => sum + val, 0) / allValues.length
        : undefined;

    // Update the log type with new aggregates
    logTypes.value[logTypeIndex].aggrs = {
      weekAvg,
      monthAvg,
      threeMonthAvg,
      totalAvg,
      lastTime,
      lastValue,
    };

    // Save updated log types to localStorage
    store.set(LocalStorageKeys.logTypes, logTypes.value);
  }

  // Recalculate aggregates for all log types (useful for initialization or data migration)
  function recalculateAllAggregates() {
    logTypes.value.forEach((logType) => {
      recalculateAggregates(logType.name);
    });
  }

  // DEBUG METHODS (remove in production)
  function shiftAllLogsDays(days: number) {
    // Get all log type names
    const allLogTypeNames = logTypes.value.map((lt) => lt.name);

    // Shift logs for each log type
    allLogTypeNames.forEach((logTypeName) => {
      const logValuesRef = getLogValues(logTypeName);

      // Update timestamps
      logValuesRef.value = logValuesRef.value.map((log) => ({
        ...log,
        timestamp: new Date(
          new Date(log.timestamp).getTime() + days * 24 * 60 * 60 * 1000
        ).toISOString(),
      }));

      // Save to localStorage
      store.set(
        `${LocalStorageKeys.logsPrefix}${logTypeName}`,
        logValuesRef.value
      );
    });

    console.log(`Shifted all logs by ${days} days`);
  }

  function debugShiftLogsOneDayEarlier() {
    shiftAllLogsDays(-1);
  }

  function debugShiftLogsOneDayLater() {
    shiftAllLogsDays(1);
  }

  function debugResetAndLoadTestData() {
    // Clear all localStorage data
    store.clear();

    // Clear reactive refs
    logValuesRefs.clear();

    // Load test log types
    logTypes.value = [...testLogTypes];
    store.set(LocalStorageKeys.logTypes, logTypes.value);

    // Load test log data
    const testLogData = [logsPushups, logsPullups];

    testLogData.forEach((testLog) => {
      // Store in localStorage
      store.set(
        `${LocalStorageKeys.logsPrefix}${testLog.name}`,
        testLog.values
      );

      // Update reactive refs
      logValuesRefs.set(testLog.name, ref<LogValue[]>([...testLog.values]));
    });

    // Recalculate aggregates for all loaded log types
    recalculateAllAggregates();

    console.log("Cleared all data and loaded test data:", {
      logTypes: logTypes.value.length,
      logData: testLogData.map((log) => ({
        name: log.name,
        values: log.values.length,
      })),
    });
  }

  // Initialize aggregates for existing data if they don't exist
  if (logTypes.value.length > 0) {
    logTypes.value.forEach((logType) => {
      if (!logType.aggrs || Object.keys(logType.aggrs).length === 0) {
        const logValues = getLogValues(logType.name).value;
        if (logValues.length > 0) {
          recalculateAggregates(logType.name);
        }
      }
    });
  }

  return {
    logTypes,
    categories,
    addLogType,
    getLogType,
    addCategory,
    getCategory,
    updateCategory,
    getLogValues,
    addLogValue,
    recalculateAggregates,
    recalculateAllAggregates,
    // Debug methods
    debugShiftLogsOneDayEarlier,
    debugShiftLogsOneDayLater,
    shiftAllLogsDays,
    debugResetAndLoadTestData,
  };
});
