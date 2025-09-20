import type { LogType, LogValue, Category } from "@/types";
import store from "store2";
import { defineStore } from "pinia";
import { ref, type Ref } from "vue";
import { isDate, isToday } from "@/helpers/dateUtils";

// Import test data
import { logTypes as testLogTypes } from "@/testData/logTypes";
import { categories as testCategories } from "@/testData/categories";
import { logsPushups } from "@/testData/logs-pushups";
import { logsPullups } from "@/testData/logs-pullups";
import { logsDiet } from "@/testData/logs-diet";

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

  function updateLogType(oldName: string, updatedLogType: LogType) {
    const index = logTypes.value.findIndex((lt) => lt.name === oldName);
    if (index !== -1) {
      // If the name changed, we need to migrate the log values to the new key
      if (oldName !== updatedLogType.name) {
        const oldKey = `${LocalStorageKeys.logsPrefix}${oldName}`;
        const newKey = `${LocalStorageKeys.logsPrefix}${updatedLogType.name}`;

        // Get existing log values from the old key
        const oldLogValues = store.get(oldKey) || [];

        // Store them under the new key
        store.set(newKey, oldLogValues);

        // Remove the old key
        store.remove(oldKey);

        // Update the reactive refs map
        if (logValuesRefs.has(oldName)) {
          const oldRef = logValuesRefs.get(oldName)!;
          logValuesRefs.delete(oldName);
          logValuesRefs.set(updatedLogType.name, oldRef);
        }
      }

      logTypes.value[index] = updatedLogType;
      store.set(LocalStorageKeys.logTypes, logTypes.value);
    }
  }

  function toggleFavorite(logTypeName: string) {
    const logType = getLogType(logTypeName);
    if (logType) {
      const updatedLogType = { ...logType, favorite: !logType.favorite };
      updateLogType(logTypeName, updatedLogType);
    }
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

  // Generic helper to update a log value based on a date predicate
  function updateLogValue(
    name: string,
    newValue: LogValue,
    datePredicate: (timestamp: string) => boolean
  ) {
    const logValuesRef = getLogValues(name);

    const index = logValuesRef.value.findIndex((lv) =>
      datePredicate(lv.timestamp)
    );

    if (index !== -1) {
      logValuesRef.value.splice(index, 1, newValue);
      store.set(`${LocalStorageKeys.logsPrefix}${name}`, logValuesRef.value);
      recalculateAggregates(name);
    }
  }

  // Replace today's log value (by timestamp range) with a new value
  function updateTodayLogValue(name: string, newValue: LogValue) {
    updateLogValue(name, newValue, (timestamp) => isToday(timestamp));
  }

  // Generic helper to increment a numeric log value based on a date predicate
  function incrementNumberValue(
    name: string,
    delta: number,
    datePredicate: (timestamp: string) => boolean,
    comment: string = ""
  ) {
    const logValuesRef = getLogValues(name);

    const index = logValuesRef.value.findIndex((lv) =>
      datePredicate(lv.timestamp)
    );

    if (index === -1) return;

    const existing = logValuesRef.value[index];
    if (typeof existing.value !== "number") return;

    const updated: LogValue = {
      value: (existing.value as number) + delta,
      timestamp: new Date().toISOString(),
      comment: comment || existing.comment || "",
    };

    logValuesRef.value.splice(index, 1, updated);
    store.set(`${LocalStorageKeys.logsPrefix}${name}`, logValuesRef.value);
    recalculateAggregates(name);
  }

  // Increment today's numeric value by delta; if not numeric or not found, no-op
  function incrementTodayNumberValue(
    name: string,
    delta: number,
    comment: string = ""
  ) {
    incrementNumberValue(
      name,
      delta,
      (timestamp) => isToday(timestamp),
      comment
    );
  }

  // Replace log value for a specific date with a new value
  function updateLogValueByDate(
    name: string,
    targetDate: Date,
    newValue: LogValue
  ) {
    updateLogValue(name, newValue, (timestamp) =>
      isDate(timestamp, targetDate)
    );
  }

  // Increment numeric value for a specific date by delta; if not numeric or not found, no-op
  function incrementNumberValueByDate(
    name: string,
    targetDate: Date,
    delta: number,
    comment: string = ""
  ) {
    incrementNumberValue(
      name,
      delta,
      (timestamp) => isDate(timestamp, targetDate),
      comment
    );
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

    // Recalculate aggregates for all log types after shifting
    recalculateAllAggregates();

    console.log(`Shifted all logs by ${days} days and recalculated aggregates`);
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

    // Load test categories
    categories.value = [...testCategories];
    store.set(LocalStorageKeys.categories, categories.value);

    // Load test log data
    const testLogData = [logsPushups, logsPullups, logsDiet];

    testLogData.forEach((testLog) => {
      // Sort LogValues by timestamp (oldest first, newest last)
      const sortedValues = [...testLog.values].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // Store sorted data in localStorage
      store.set(`${LocalStorageKeys.logsPrefix}${testLog.name}`, sortedValues);

      // Update reactive refs with sorted data
      logValuesRefs.set(testLog.name, ref<LogValue[]>(sortedValues));
    });

    // Recalculate aggregates for all loaded log types
    recalculateAllAggregates();

    console.log("Cleared all data and loaded test data:", {
      logTypes: logTypes.value.length,
      categories: categories.value.length,
      logData: testLogData.map((log) => ({
        name: log.name,
        values: log.values.length,
      })),
    });
  }

  // Initialize aggregates and migrate data for existing LogTypes
  if (logTypes.value.length > 0) {
    logTypes.value.forEach((logType, index) => {
      let needsUpdate = false;

      // Migrate: ensure favorite field exists
      if (logType.favorite === undefined) {
        logTypes.value[index].favorite = false;
        needsUpdate = true;
      }

      // Migrate: ensure category field exists
      if (logType.category === undefined) {
        logTypes.value[index].category = undefined;
        needsUpdate = true;
      }

      // Initialize aggregates if they don't exist
      if (!logType.aggrs || Object.keys(logType.aggrs).length === 0) {
        const logValues = getLogValues(logType.name).value;
        if (logValues.length > 0) {
          recalculateAggregates(logType.name);
        }
      }

      // Save if any migration was performed
      if (needsUpdate) {
        store.set(LocalStorageKeys.logTypes, logTypes.value);
      }
    });
  }

  return {
    logTypes,
    categories,
    addLogType,
    getLogType,
    updateLogType,
    toggleFavorite,
    addCategory,
    getCategory,
    updateCategory,
    getLogValues,
    addLogValue,
    updateTodayLogValue,
    incrementTodayNumberValue,
    updateLogValueByDate,
    incrementNumberValueByDate,
    recalculateAggregates,
    recalculateAllAggregates,
    // Debug methods
    debugShiftLogsOneDayEarlier,
    debugShiftLogsOneDayLater,
    shiftAllLogsDays,
    debugResetAndLoadTestData,
  };
});
