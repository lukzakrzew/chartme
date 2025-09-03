import { describe, it, expect, beforeEach, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import type { LogType, LogValue } from "@/types";
import { useUnfilledLogTypes } from "./useUnfilledLogTypes";

// Mock the logs store
const mockLogsStore = {
  logTypes: [] as LogType[],
  getLogValues: vi.fn(),
};

// Mock the useLogsStore composable
vi.mock("@/stores/Logs", () => ({
  useLogsStore: () => mockLogsStore,
}));

describe("useUnfilledLogTypes", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockLogsStore.logTypes = [];
    mockLogsStore.getLogValues.mockReset();
  });

  describe("frequency handling", () => {
    it("should return unfilled log type with frequency 1 and no recent logs", () => {
      const logType: LogType = {
        name: "Daily Exercise",
        type: "boolean" as any,
        desc: "Daily exercise",
        frequency: 1,
        oneToTen: false,
        favorite: false,
        archived: false,
        aggrs: {
          weekAvg: 0,
          monthAvg: 0,
          threeMonthAvg: 0,
          totalAvg: 0,
          lastTime: undefined,
          lastValue: undefined,
        },
      };

      mockLogsStore.logTypes = [logType];
      mockLogsStore.getLogValues.mockReturnValue({
        value: [], // No logs
      });

      const { unfilledLogTypes } = useUnfilledLogTypes();
      expect(unfilledLogTypes.value).toHaveLength(1);
      expect(unfilledLogTypes.value[0].name).toBe("Daily Exercise");
    });

    it("should return unfilled log type with frequency 1 and old logs", () => {
      const logType: LogType = {
        name: "Daily Exercise",
        type: "boolean" as any,
        desc: "Daily exercise",
        frequency: 1,
        oneToTen: false,
        favorite: false,
        archived: false,
        aggrs: {
          weekAvg: 0,
          monthAvg: 0,
          threeMonthAvg: 0,
          totalAvg: 0,
          lastTime: undefined,
          lastValue: undefined,
        },
      };

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const oldLog: LogValue = {
        value: true,
        timestamp: yesterday.toISOString(),
        comment: "",
      };

      mockLogsStore.logTypes = [logType];
      mockLogsStore.getLogValues.mockReturnValue({
        value: [oldLog],
      });

      const { unfilledLogTypes } = useUnfilledLogTypes();
      expect(unfilledLogTypes.value).toHaveLength(1);
    });

    it("should not return filled log type with frequency 1 and today's log", () => {
      const today = new Date();
      const logType: LogType = {
        name: "Daily Exercise",
        type: "boolean" as any,
        desc: "Daily exercise",
        frequency: 1,
        oneToTen: false,
        favorite: false,
        archived: false,
        aggrs: {
          weekAvg: 0,
          monthAvg: 0,
          threeMonthAvg: 0,
          totalAvg: 0,
          lastTime: today.toISOString(), // Today's log
          lastValue: true,
        },
      };

      mockLogsStore.logTypes = [logType];

      const { unfilledLogTypes } = useUnfilledLogTypes();
      expect(unfilledLogTypes.value).toHaveLength(0);
    });

    it("should return unfilled log type with frequency 1 when last log was yesterday at 23:55", () => {
      // Simulate logging yesterday at 23:55
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(23, 55, 0, 0); // Yesterday at 23:55

      const logType: LogType = {
        name: "Daily Exercise",
        type: "boolean" as any,
        desc: "Daily exercise",
        frequency: 1,
        oneToTen: false,
        favorite: false,
        archived: false,
        aggrs: {
          weekAvg: 0,
          monthAvg: 0,
          threeMonthAvg: 0,
          totalAvg: 0,
          lastTime: yesterday.toISOString(), // Yesterday 23:55
          lastValue: true,
        },
      };

      mockLogsStore.logTypes = [logType];

      const { unfilledLogTypes } = useUnfilledLogTypes();
      expect(unfilledLogTypes.value).toHaveLength(1); // Should need filling today
      expect(unfilledLogTypes.value[0].name).toBe("Daily Exercise");
    });

    it("should not return filled log type with frequency 1 when logged today at 00:01", () => {
      // Simulate logging today at 00:01 (just after midnight)
      const todayEarly = new Date();
      todayEarly.setHours(0, 1, 0, 0); // Today at 00:01

      const logType: LogType = {
        name: "Daily Exercise",
        type: "boolean" as any,
        desc: "Daily exercise",
        frequency: 1,
        oneToTen: false,
        favorite: false,
        archived: false,
        aggrs: {
          weekAvg: 0,
          monthAvg: 0,
          threeMonthAvg: 0,
          totalAvg: 0,
          lastTime: todayEarly.toISOString(), // Today at 00:01
          lastValue: true,
        },
      };

      mockLogsStore.logTypes = [logType];

      const { unfilledLogTypes } = useUnfilledLogTypes();
      expect(unfilledLogTypes.value).toHaveLength(0); // Should NOT need filling (already logged today)
    });

    it("should return unfilled log type with frequency 7 and no logs in 7 days", () => {
      const logType: LogType = {
        name: "Weekly Review",
        type: "boolean" as any,
        desc: "Weekly review",
        frequency: 7,
        oneToTen: false,
        favorite: false,
        archived: false,
        aggrs: {
          weekAvg: 0,
          monthAvg: 0,
          threeMonthAvg: 0,
          totalAvg: 0,
          lastTime: undefined,
          lastValue: undefined,
        },
      };

      const eightDaysAgo = new Date();
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

      const oldLog: LogValue = {
        value: true,
        timestamp: eightDaysAgo.toISOString(),
        comment: "",
      };

      mockLogsStore.logTypes = [logType];
      mockLogsStore.getLogValues.mockReturnValue({
        value: [oldLog],
      });

      const { unfilledLogTypes } = useUnfilledLogTypes();
      expect(unfilledLogTypes.value).toHaveLength(1);
    });

    it("should not return filled log type with frequency 7 and recent log within 7 days", () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const logType: LogType = {
        name: "Weekly Review",
        type: "boolean" as any,
        desc: "Weekly review",
        frequency: 7,
        oneToTen: false,
        favorite: false,
        archived: false,
        aggrs: {
          weekAvg: 0,
          monthAvg: 0,
          threeMonthAvg: 0,
          totalAvg: 0,
          lastTime: threeDaysAgo.toISOString(), // Recent log (3 days ago)
          lastValue: true,
        },
      };

      mockLogsStore.logTypes = [logType];

      const { unfilledLogTypes } = useUnfilledLogTypes();
      expect(unfilledLogTypes.value).toHaveLength(0);
    });
  });

  describe("archived log types", () => {
    it("should exclude archived log types", () => {
      const archivedLogType: LogType = {
        name: "Archived Task",
        type: "boolean" as any,
        desc: "Archived task",
        frequency: 1,
        oneToTen: false,
        favorite: false,
        archived: true, // Archived!
        aggrs: {
          weekAvg: 0,
          monthAvg: 0,
          threeMonthAvg: 0,
          totalAvg: 0,
          lastTime: undefined,
          lastValue: undefined,
        },
      };

      const activeLogType: LogType = {
        name: "Active Task",
        type: "boolean" as any,
        desc: "Active task",
        frequency: 1,
        oneToTen: false,
        favorite: false,
        archived: false,
        aggrs: {
          weekAvg: 0,
          monthAvg: 0,
          threeMonthAvg: 0,
          totalAvg: 0,
          lastTime: undefined,
          lastValue: undefined,
        },
      };

      mockLogsStore.logTypes = [archivedLogType, activeLogType];
      mockLogsStore.getLogValues.mockReturnValue({
        value: [], // No logs for either
      });

      const { unfilledLogTypes } = useUnfilledLogTypes();
      expect(unfilledLogTypes.value).toHaveLength(1);
      expect(unfilledLogTypes.value[0].name).toBe("Active Task");
    });
  });

  describe("category filtering", () => {
    it("should filter by category when categoryName is provided", () => {
      const fitnessLogType: LogType = {
        name: "Exercise",
        type: "boolean" as any,
        desc: "Exercise",
        frequency: 1,
        oneToTen: false,
        favorite: false,
        archived: false,
        category: "Fitness",
        aggrs: {
          weekAvg: 0,
          monthAvg: 0,
          threeMonthAvg: 0,
          totalAvg: 0,
          lastTime: undefined,
          lastValue: undefined,
        },
      };

      const dietLogType: LogType = {
        name: "Meal Tracking",
        type: "boolean" as any,
        desc: "Meal tracking",
        frequency: 1,
        oneToTen: false,
        favorite: false,
        archived: false,
        category: "Diet",
        aggrs: {
          weekAvg: 0,
          monthAvg: 0,
          threeMonthAvg: 0,
          totalAvg: 0,
          lastTime: undefined,
          lastValue: undefined,
        },
      };

      mockLogsStore.logTypes = [fitnessLogType, dietLogType];
      mockLogsStore.getLogValues.mockReturnValue({
        value: [], // No logs for either
      });

      const { unfilledLogTypes } = useUnfilledLogTypes("Fitness");
      expect(unfilledLogTypes.value).toHaveLength(1);
      expect(unfilledLogTypes.value[0].name).toBe("Exercise");
    });

    it("should return all categories when no categoryName is provided", () => {
      const fitnessLogType: LogType = {
        name: "Exercise",
        type: "boolean" as any,
        desc: "Exercise",
        frequency: 1,
        oneToTen: false,
        favorite: false,
        archived: false,
        category: "Fitness",
        aggrs: {
          weekAvg: 0,
          monthAvg: 0,
          threeMonthAvg: 0,
          totalAvg: 0,
          lastTime: undefined,
          lastValue: undefined,
        },
      };

      const dietLogType: LogType = {
        name: "Meal Tracking",
        type: "boolean" as any,
        desc: "Meal tracking",
        frequency: 1,
        oneToTen: false,
        favorite: false,
        archived: false,
        category: "Diet",
        aggrs: {
          weekAvg: 0,
          monthAvg: 0,
          threeMonthAvg: 0,
          totalAvg: 0,
          lastTime: undefined,
          lastValue: undefined,
        },
      };

      mockLogsStore.logTypes = [fitnessLogType, dietLogType];
      mockLogsStore.getLogValues.mockReturnValue({
        value: [], // No logs for either
      });

      const { unfilledLogTypes } = useUnfilledLogTypes();
      expect(unfilledLogTypes.value).toHaveLength(2);
    });
  });

  describe("edge cases", () => {
    it("should handle empty log types array", () => {
      mockLogsStore.logTypes = [];
      mockLogsStore.getLogValues.mockReturnValue({
        value: [],
      });

      const { unfilledLogTypes } = useUnfilledLogTypes();
      expect(unfilledLogTypes.value).toHaveLength(0);
    });

    it("should handle log type with undefined category", () => {
      const logType: LogType = {
        name: "Uncategorized Task",
        type: "boolean" as any,
        desc: "Uncategorized task",
        frequency: 1,
        oneToTen: false,
        favorite: false,
        archived: false,
        category: undefined,
        aggrs: {
          weekAvg: 0,
          monthAvg: 0,
          threeMonthAvg: 0,
          totalAvg: 0,
          lastTime: undefined,
          lastValue: undefined,
        },
      };

      mockLogsStore.logTypes = [logType];
      mockLogsStore.getLogValues.mockReturnValue({
        value: [],
      });

      const { unfilledLogTypes } = useUnfilledLogTypes("Fitness");
      expect(unfilledLogTypes.value).toHaveLength(0); // Should be filtered out
    });
  });

  describe("isLogTypeFilledRecently function", () => {
    it("should return true for log type with recent log within frequency period", () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const logType: LogType = {
        name: "Weekly Task",
        type: "boolean" as any,
        desc: "Weekly task",
        frequency: 7,
        oneToTen: false,
        favorite: false,
        archived: false,
        aggrs: {
          weekAvg: 0,
          monthAvg: 0,
          threeMonthAvg: 0,
          totalAvg: 0,
          lastTime: threeDaysAgo.toISOString(), // Recent log (3 days ago)
          lastValue: true,
        },
      };

      const { isLogTypeFilledRecently } = useUnfilledLogTypes();
      expect(isLogTypeFilledRecently(logType)).toBe(true);
    });

    it("should return false for log type with old log outside frequency period", () => {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      const logType: LogType = {
        name: "Weekly Task",
        type: "boolean" as any,
        desc: "Weekly task",
        frequency: 7,
        oneToTen: false,
        favorite: false,
        archived: false,
        aggrs: {
          weekAvg: 0,
          monthAvg: 0,
          threeMonthAvg: 0,
          totalAvg: 0,
          lastTime: tenDaysAgo.toISOString(), // Old log (10 days ago)
          lastValue: true,
        },
      };

      const { isLogTypeFilledRecently } = useUnfilledLogTypes();
      expect(isLogTypeFilledRecently(logType)).toBe(false);
    });

    it("should return false for log type with no logs", () => {
      const logType: LogType = {
        name: "New Task",
        type: "boolean" as any,
        desc: "New task",
        frequency: 1,
        oneToTen: false,
        favorite: false,
        archived: false,
        aggrs: {
          weekAvg: 0,
          monthAvg: 0,
          threeMonthAvg: 0,
          totalAvg: 0,
          lastTime: undefined, // No logs
          lastValue: undefined,
        },
      };

      const { isLogTypeFilledRecently } = useUnfilledLogTypes();
      expect(isLogTypeFilledRecently(logType)).toBe(false);
    });
  });
});
