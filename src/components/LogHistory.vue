<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import type { LogValue } from "@/types";

interface Props {
  logValues: LogValue[];
}

const { logValues } = defineProps<Props>();
const router = useRouter();
const route = useRoute();

// Track which comments are expanded in the log history
const expandedComments = ref(new Set<string>());

const toggleCommentVisibility = (timestamp: string) => {
  if (expandedComments.value.has(timestamp)) {
    expandedComments.value.delete(timestamp);
  } else {
    expandedComments.value.add(timestamp);
  }
};

const goToChart = () => {
  const logTypeName = route.params.logTypeName as string;
  router.push(`/chart/${logTypeName}`);
};

// Check if we're currently on the chart page
const isOnChartPage = () => {
  return route.path.startsWith("/chart/");
};
</script>

<template>
  <div class="bottom-half">
    <div class="history-header">
      <h5>Log History</h5>
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
      <div v-if="logValues.length === 0" class="no-logs">
        No log entries yet
      </div>
      <div
        v-else
        v-for="logValue in logValues.slice().reverse()"
        :key="logValue.timestamp"
        class="log-entry"
      >
        <div class="log-value-display">
          <span class="value">
            {{
              typeof logValue.value === "boolean"
                ? logValue.value
                  ? "✅"
                  : "❌"
                : logValue.value
            }}
          </span>
          <div class="right-section">
            <span class="timestamp">{{
              new Date(logValue.timestamp).toLocaleString()
            }}</span>
            <span
              class="comment-icon"
              :class="{ visible: logValue.comment }"
              @click="
                logValue.comment
                  ? toggleCommentVisibility(logValue.timestamp)
                  : null
              "
            >
              💬
            </span>
          </div>
        </div>
        <div
          v-if="logValue.comment && expandedComments.has(logValue.timestamp)"
          class="comment"
        >
          {{ logValue.comment }}
        </div>
      </div>
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

.history-header h5 {
  margin: 0;
}

.chart-button {
  background: none;
  border: 1px solid #ddd;
  border-radius: 6px;
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

.log-entry {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 8px;
  background-color: #fafafa;
}

.log-value-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.value {
  font-size: 1.2em;
}

.timestamp {
  font-size: 0.9em;
  color: #666;
}

.comment-icon {
  font-size: 1em;
  opacity: 0;
  pointer-events: none;
  transition: all 0.2s;
}

.comment-icon.visible {
  opacity: 0.7;
  pointer-events: auto;
  cursor: pointer;
}

.comment-icon.visible:hover {
  opacity: 1;
  transform: scale(1.2);
}

.comment {
  font-style: italic;
  color: #555;
  margin-top: 5px;
}
</style>
