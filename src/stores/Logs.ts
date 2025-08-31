import type { LogType, LogValue } from "@/types";
import store from "store2";
import { defineStore } from "pinia";
import { ref, type Ref } from "vue";

// Import test data
import { logTypes as testLogTypes } from "@/testData/logTypes";
import { logsPushups } from "@/testData/logs-pushups";
import { logsPullups } from "@/testData/logs-pullups";

export const LocalStorageKeys = {
  logTypes: "logTypes",
  logsPrefix: "logs-",
} as const;

export const useLogsStore = defineStore("logs", () => {
  const logTypes = ref<LogType[]>(store.get(LocalStorageKeys.logTypes) || []);
  const logValuesRefs = new Map<string, Ref<LogValue[]>>();

  function addLogType(logType: LogType) {
    logTypes.value.push(logType);
    store.set(LocalStorageKeys.logTypes, logTypes.value);
  }

  function getLogType(name: string) {
    return logTypes.value.find((lt) => lt.name === name);
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

    console.log("Cleared all data and loaded test data:", {
      logTypes: logTypes.value.length,
      logData: testLogData.map((log) => ({
        name: log.name,
        values: log.values.length,
      })),
    });
  }

  return {
    logTypes,
    addLogType,
    getLogType,
    getLogValues,
    addLogValue,
    // Debug methods
    debugShiftLogsOneDayEarlier,
    debugShiftLogsOneDayLater,
    shiftAllLogsDays,
    debugResetAndLoadTestData,
  };
});
