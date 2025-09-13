<script setup lang="ts">
import { computed } from "vue";
import type { LogType, LogValue } from "@/types";
import { useLogsStore } from "@/stores/Logs";
import { useUnfilledLogTypes } from "@/composables/useUnfilledLogTypes";
import AddLogForm from "@/components/AddLogForm.vue";

interface Props {
  currentLogType: LogType | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  submit: [logValue: LogValue];
  skip: [];
}>();

const logsStore = useLogsStore();
const { isLogTypeFilledRecently } = useUnfilledLogTypes();

// Check if current log type has been filled recently (based on frequency)
const hasLogForToday = computed((): boolean => {
  if (!props.currentLogType) return false;
  return isLogTypeFilledRecently(props.currentLogType);
});

// Handle log submission
const handleLogSubmit = (logValue: LogValue) => {
  emit("submit", logValue);
};

const handleSkip = () => {
  emit("skip");
};
</script>

<template>
  <div v-if="currentLogType" class="fill-in-form">
    <AddLogForm
      :log-type="currentLogType"
      :log-values="logsStore.getLogValues(currentLogType.name).value"
      :has-log-for-today="hasLogForToday"
      @submit="handleLogSubmit"
    />

    <!-- Navigation controls -->
    <div class="navigation-controls">
      <button @click="handleSkip" class="nav-btn secondary">
        Skip for now
      </button>
    </div>
  </div>
</template>

<style scoped>
.fill-in-form {
  max-width: 600px;
  margin: 0 auto;
}

.navigation-controls {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9em;
}

.nav-btn:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #ccc;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-btn.secondary {
  color: #666;
}
</style>
