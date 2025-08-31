<script setup lang="ts">
import { useLogsStore } from "@/stores/Logs";
import { useRoute } from "vue-router";
import { computed } from "vue";
import type { LogValue } from "@/types";
import LogHistory from "@/components/LogHistory.vue";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import { Chart } from "vue-chartjs";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const route = useRoute();
const logsStore = useLogsStore();
const logTypeName = route.params.logTypeName as string;

const logType = logsStore.getLogType(logTypeName);
const logValues = logsStore.getLogValues(logTypeName);

// Generate last 30 days
const getLast30Days = () => {
  const days = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split("T")[0]);
  }

  return days;
};

// Prepare chart data
const chartData = computed(() => {
  const last30Days = getLast30Days();

  // Create a map of dates to values from logValues
  const valuesByDate: { [date: string]: number | boolean } = {};

  if (logValues.value) {
    logValues.value.forEach((log: LogValue) => {
      const logDate = new Date(log.timestamp).toISOString().split("T")[0];
      if (last30Days.includes(logDate)) {
        valuesByDate[logDate] = log.value;
      }
    });
  }

  // Map the data to chart format
  const data = last30Days.map((date) => {
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

    // Filter out null values for average calculation
    const validValues = window.filter((v) => v !== null) as number[];

    if (validValues.length === 0) {
      return null;
    }

    // Calculate average
    const sum = validValues.reduce((acc, val) => acc + val, 0);
    return sum / validValues.length;
  });

  const labels = last30Days.map((date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });

  return {
    labels,
    datasets: [
      {
        label: logType?.name || "Values",
        data,
        backgroundColor: "#007bff",
        borderColor: "#0056b3",
        borderWidth: 1,
        type: "bar" as const,
      },
      {
        label: "7-Day Average",
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
  const isBoolean = logType?.type === "boolean";

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `${logType?.name || "Log"} - Last 30 Days`,
      },
      legend: {
        display: true,
        position: "top" as const,
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
          display: true,
          text: isBoolean ? "Value" : logType?.desc || "Value",
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
        max: isBoolean ? 1 : logType?.max || undefined,
        min: isBoolean ? 0 : logType?.min || undefined,
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
    <div class="chart-section">
      <div class="chart-area">
        <Chart type="bar" :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <LogHistory :log-values="logValues" />
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
  border-bottom: 1px solid #eee;
  min-height: 400px;
}

.chart-area {
  height: 100%;
  position: relative;
}
</style>
