<script setup lang="ts">
import { useLogsStore } from "@/stores/Logs";
import { useRoute } from "vue-router";
import { computed } from "vue";
import type { LogValue } from "@/types";
import LogHistory from "@/components/LogHistory.vue";
import AddLogForm from "@/components/AddLogForm.vue";

const route = useRoute();
const logsStore = useLogsStore();
const logTypeName = route.params.logTypeName as string;

const logType = logsStore.getLogType(logTypeName);
const logValues = logsStore.getLogValues(logTypeName);

// Check if there's already a log for today
const hasLogForToday = computed((): boolean => {
  if (!logValues.value || logValues.value.length === 0) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow

  return logValues.value.some((log: LogValue) => {
    const logDate = new Date(log.timestamp);
    return logDate >= today && logDate < tomorrow;
  });
});

// Handle log submission from AddLogForm component
const handleLogSubmit = (logValue: LogValue) => {
  logsStore.addLogValue(logTypeName, logValue);
};
</script>

<template>
  <div v-if="!logType" class="no-such-log-type">No such log type</div>
  <div v-else class="add-log-container">
    <div class="top-half">
      <AddLogForm
        :log-type="logType"
        :log-values="logValues"
        :has-log-for-today="hasLogForToday"
        @submit="handleLogSubmit"
      />
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
  align-self: center;
}

.add-log-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-half {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #eee;
}
</style>
