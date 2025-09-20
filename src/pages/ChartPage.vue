<script setup lang="ts">
import { useLogsStore } from "@/stores/Logs";
import { useRoute, useRouter } from "vue-router";
import { computed, ref } from "vue";
import type { LogValue } from "@/types";
import LogHistory from "@/components/LogHistory.vue";
import LogTypeSwitcher from "@/components/LogTypeSwitcher.vue";
import { Chart } from "vue-chartjs";

const route = useRoute();
const router = useRouter();
const logsStore = useLogsStore();

const logTypeName = computed(() => route.params.logTypeName as string);

const logType = computed(() => logsStore.getLogType(logTypeName.value));
const logValues = computed(() => logsStore.getLogValues(logTypeName.value));

// Track current period offset (0 = most recent period, 1 = previous period, etc.)
const periodOffset = ref(0);

// Track selected day range (30 or 90 days)
const selectedDays = ref(30);

// Navigation functions
const goToPreviousPeriod = () => {
  periodOffset.value++;
};

const goToNextPeriod = () => {
  if (periodOffset.value > 0) {
    periodOffset.value--;
  }
};

// Day range switcher functions
const setDayRange = (days: number) => {
  selectedDays.value = days;
  // Reset to current period when switching day ranges
  periodOffset.value = 0;
};

// Check if navigation buttons should be enabled
const canGoNext = computed(() => periodOffset.value > 0);
const canGoPrevious = computed(() => {
  // Allow going back if there's data in the previous period
  // For simplicity, we'll allow going back up to 10 periods
  return periodOffset.value < 10;
});

// Log type change handler
const onLogTypeChange = (newLogTypeName: string) => {
  if (newLogTypeName && newLogTypeName !== logTypeName.value) {
    router.push(`/chart/${encodeURIComponent(newLogTypeName)}`);
  }
};

// Get the date range for display
const currentDateRange = computed(() => {
  const days = getDaysForPeriod(periodOffset.value, selectedDays.value);
  const startDate = new Date(days[0]);
  const endDate = new Date(days[days.length - 1]);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
});

// Generate days for the current period
const getDaysForPeriod = (offset: number, dayCount: number) => {
  const days = [];
  const today = new Date();

  // Calculate the start date based on offset
  const startOffset = offset * dayCount;
  const endOffset = startOffset + dayCount - 1;

  for (let i = endOffset; i >= startOffset; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split("T")[0]);
  }

  return days;
};

// Prepare chart data
const chartData = computed(() => {
  const currentPeriodDays = getDaysForPeriod(
    periodOffset.value,
    selectedDays.value
  );

  // Create a map of dates to values from logValues
  const valuesByDate: { [date: string]: number | boolean } = {};

  if (logValues.value) {
    logValues.value.value.forEach((log: LogValue) => {
      const logDate = new Date(log.timestamp).toISOString().split("T")[0];
      if (currentPeriodDays.includes(logDate)) {
        valuesByDate[logDate] = log.value;
      }
    });
  }

  // Map the data to chart format
  const data = currentPeriodDays.map((date) => {
    const value = valuesByDate[date];
    if (value === undefined || value === null) {
      return null;
    }
    // Convert boolean to number for chart
    return typeof value === "boolean" ? (value ? 1 : 0) : value;
  });

  // Calculate 7-day moving average
  const movingAverage = data.map((_, index) => {
    // Get the last 7 values (including current day)
    const startIndex = Math.max(0, index - 6);
    const window = data.slice(startIndex, index + 1);

    // Convert null values to 0 for moving average calculation
    const valuesWithZeros = window.map((v) => (v === null ? 0 : v)) as number[];

    // Calculate average
    const sum = valuesWithZeros.reduce((acc, val) => acc + val, 0);
    return sum / valuesWithZeros.length;
  });

  const labels = currentPeriodDays.map((date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });

  return {
    labels,
    datasets: [
      {
        label: "",
        data,
        backgroundColor: "#007bff",
        borderColor: "#0056b3",
        borderWidth: 1,
        type: "bar" as const,
      },
      {
        label: "",
        data: movingAverage,
        borderColor: "#28a745",
        backgroundColor: "rgba(40, 167, 69, 0.1)",
        borderWidth: 2,
        type: "line" as const,
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: false,
      },
    ],
  };
});

// Chart options
const chartOptions = computed(() => {
  const isBoolean = logType.value?.type === "boolean";

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: false,
      },
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = context.parsed.y;
            if (value === null) return "No data";

            // Special handling for moving average
            if (context.dataset.label === "7-Day Average") {
              if (isBoolean) {
                const percentage = (value * 100).toFixed(1);
                return `7-Day Average: ${percentage}% (${value.toFixed(2)})`;
              }
              return `7-Day Average: ${value.toFixed(2)}`;
            }

            if (isBoolean) {
              return `${context.dataset.label}: ${
                value === 1 ? "Yes ✅" : "No ❌"
              }`;
            }
            return `${context.dataset.label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      y: {
        title: {
          display: false,
        },
        beginAtZero: true,
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: isBoolean
          ? {
              stepSize: 1,
              callback: function (value: any) {
                if (value === 0) return "No ❌";
                if (value === 1) return "Yes ✅";
                return value;
              },
            }
          : undefined,
        max: isBoolean ? 1 : logType.value?.oneToTen ? 10 : undefined,
        min: isBoolean ? 0 : logType.value?.oneToTen ? 1 : undefined,
      },
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
  };
});
</script>

<template>
  <div v-if="!logType" class="no-such-log-type">No such log type</div>
  <div v-else class="chart-container">
    <!-- Log Type Switcher -->
    <LogTypeSwitcher
      :current-log-type-name="logTypeName"
      @change="onLogTypeChange"
    />

    <div class="chart-section">
      <div class="navigation-bar">
        <div class="nav-left">
          <button
            @click="goToPreviousPeriod"
            :disabled="!canGoPrevious"
            class="nav-button"
          >
            ←
          </button>
        </div>

        <div class="nav-center">
          <div class="day-switcher">
            <button
              @click="setDayRange(30)"
              :class="{ active: selectedDays === 30 }"
              class="day-button"
            >
              30d
            </button>
            <button
              @click="setDayRange(90)"
              :class="{ active: selectedDays === 90 }"
              class="day-button"
            >
              90d
            </button>
          </div>
          <div class="date-range">{{ currentDateRange }}</div>
        </div>

        <div class="nav-right">
          <button
            @click="goToNextPeriod"
            :disabled="!canGoNext"
            class="nav-button"
          >
            →
          </button>
        </div>
      </div>
      <div class="chart-area">
        <Chart type="bar" :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <LogHistory :log-values="logValues.value" />
  </div>
</template>

<style scoped>
.no-such-log-type {
  padding: 50px;
  color: red;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.chart-section {
  flex: 1;
  padding: 20px;
  padding-top: 0;
  border-bottom: 1px solid #eee;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.navigation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0;
}

.nav-left,
.nav-right {
  flex: 0 0 auto;
  width: 50px;
  display: flex;
  justify-content: center;
}

.nav-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.day-switcher {
  display: flex;
  gap: 4px;
  background: #f8f9fa;
  padding: 2px;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.nav-button {
  padding: 0;
  border: 1px solid #ddd;
  background: #f8f9fa;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 5px;
}

.nav-button:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.day-button {
  padding: 4px 12px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  color: #6c757d;
  transition: all 0.2s;
}

.day-button.active {
  background: #007bff;
  color: white;
}

.day-button:hover:not(.active) {
  background: #e9ecef;
  color: #495057;
}

.date-range {
  font-weight: 500;
  font-size: 14px;
  color: #495057;
}

.chart-area {
  flex: 1;
  position: relative;
}
</style>
