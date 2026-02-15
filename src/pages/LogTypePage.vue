<script setup lang="ts">
import { useLogsStore } from "@/stores/Logs";
import { useRoute, useRouter } from "vue-router";
import { computed, ref } from "vue";
import type { LogValue } from "@/types";
import { isToday } from "@/helpers/dateUtils";
import LogHistory from "@/components/LogHistory.vue";
import AddLogForm from "@/components/AddLogForm.vue";
import LogTypeSwitcher from "@/components/LogTypeSwitcher.vue";

const route = useRoute();
const router = useRouter();
const logsStore = useLogsStore();
const logTypeName = route.params.logTypeName as string;

const logType = logsStore.getLogType(logTypeName);
const logValues = logsStore.getLogValues(logTypeName);

// Check if there's already a log for today
const hasLogForToday = computed((): boolean => {
  if (!logValues.value || logValues.value.length === 0) {
    return false;
  }

  return logValues.value.some((log: LogValue) => isToday(log.timestamp));
});

// Handle log submission from AddLogForm component
const handleLogSubmit = (logValue: LogValue) => {
  logsStore.addLogValue(logTypeName, logValue);
};

const handleUpdate = (date: Date | null, logValue: LogValue) => {
  if (date) {
    logsStore.updateLogValueByDate(logTypeName, date, logValue);
  } else {
    logsStore.updateTodayLogValue(logTypeName, logValue);
  }
};

const handleIncrement = (date: Date | null, delta: number, comment: string) => {
  if (date) {
    logsStore.incrementNumberValueByDate(logTypeName, date, delta, comment);
  } else {
    logsStore.incrementTodayNumberValue(logTypeName, delta, comment);
  }
};

// Handle date click from LogHistory component
const selectedDate = ref<Date | null>(null);

const handleDateClick = (date: Date) => {
  selectedDate.value = date;
};

// Log type change handler
const onLogTypeChange = (newLogTypeName: string) => {
  if (newLogTypeName && newLogTypeName !== logTypeName) {
    router.push(`/log/${encodeURIComponent(newLogTypeName)}`);
  }
};
</script>

<template>
  <div v-if="!logType" class="no-such-log-type">No such log type</div>
  <div v-else class="add-log-container">
    <!-- Log Type Switcher -->
    <LogTypeSwitcher
      :current-log-type-name="logTypeName"
      @change="onLogTypeChange"
    />

    <div class="top-half">
      <AddLogForm
        :log-type="logType"
        :log-values="logValues"
        :has-log-for-today="hasLogForToday"
        :selected-date="selectedDate || undefined"
        @submit="handleLogSubmit"
        @update="handleUpdate"
        @increment="handleIncrement"
      />
    </div>

    <LogHistory :log-values="logValues" @date-click="handleDateClick" />
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
