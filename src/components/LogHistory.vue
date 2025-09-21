<script setup lang="ts">
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import type { LogValue } from "@/types";
import LogHistoryItem from "./LogHistoryItem.vue";

interface Props {
  logValues: LogValue[];
}

const { logValues } = defineProps<Props>();
const router = useRouter();
const route = useRoute();

const emit = defineEmits<{
  dateClick: [date: Date];
}>();

// Generate date entries for display (from oldest log to today)
const dateEntries = computed(() => {
  if (logValues.length === 0) {
    return [];
  }

  // Find the oldest log date
  const oldestLogDate = new Date(
    Math.min(...logValues.map((log) => new Date(log.timestamp).getTime()))
  );

  // Start from the oldest log date
  const startDate = new Date(oldestLogDate);
  startDate.setHours(0, 0, 0, 0); // Start of day

  // End at today
  const endDate = new Date();
  endDate.setHours(0, 0, 0, 0); // Start of day

  const entries: Array<{ date: Date; logValue?: LogValue }> = [];

  // Create a map of log values by date string for quick lookup
  const logValuesByDate = new Map<string, LogValue>();
  logValues.forEach((log) => {
    const dateStr = new Date(log.timestamp).toDateString();
    logValuesByDate.set(dateStr, log);
  });

  // Generate entries for each date from oldest to today
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toDateString();
    const logValue = logValuesByDate.get(dateStr);

    entries.push({
      date: new Date(currentDate),
      logValue,
    });

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Return in reverse chronological order (newest first)
  return entries.reverse();
});

const goToChart = () => {
  const logTypeName = route.params.logTypeName as string;
  router.push(`/chart/${logTypeName}`);
};

// Check if we're currently on the chart page
const isOnChartPage = () => {
  return route.path.startsWith("/chart/");
};

const handleDateClick = (date: Date) => {
  emit("dateClick", date);
};
</script>

<template>
  <div class="bottom-half">
    <div class="history-header">
      <button
        v-if="!isOnChartPage()"
        class="chart-button"
        @click="goToChart"
        title="View Chart"
      >
        📊
      </button>
    </div>
    <div class="log-values-list">
      <div v-if="dateEntries.length === 0" class="no-logs">
        No log entries yet
      </div>
      <LogHistoryItem
        v-for="entry in dateEntries"
        :key="entry.date.toISOString()"
        :entry="entry"
        @date-click="handleDateClick"
      />
    </div>
  </div>
</template>

<style scoped>
.bottom-half {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
}

.chart-button {
  background: none;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 1.2em;
  transition: all 0.2s;
}

.chart-button:hover {
  background-color: #f5f5f5;
  border-color: #ccc;
  transform: scale(1.05);
}

.log-values-list {
  margin-top: 15px;
}

.no-logs {
  color: #888;
  font-style: italic;
  text-align: center;
  padding: 20px;
}
</style>
