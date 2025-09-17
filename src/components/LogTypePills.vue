<script setup lang="ts">
import type { LogType } from "@/types";

interface Props {
  currentLogType: LogType | null;
  isLogTypeFilledRecently: (logType: LogType) => boolean;
  logTypes: LogType[];
  categoryName?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  jumpTo: [logTypeName: string];
}>();

// Determine pill class for each log type
const getPillClass = (logType: LogType) => {
  const isFilled = props.isLogTypeFilledRecently(logType);
  const isCurrent = props.currentLogType?.name === logType.name;

  if (isFilled) return "filled-pill";
  if (isCurrent) return "current-pill";
  return "";
};

const handleJumpTo = (logTypeName: string) => {
  emit("jumpTo", logTypeName);
};
</script>

<template>
  <div v-if="logTypes.length > 0" class="log-types-section">
    <div class="section-header">
      <span v-if="props.categoryName"
        >{{ logTypes.length }} log types in {{ props.categoryName }}</span
      >
      <span v-else>{{ logTypes.length }} log types</span>
    </div>
    <div class="pills-container">
      <button
        v-for="logType in logTypes"
        :key="logType.name"
        class="pill-button"
        :class="getPillClass(logType)"
        @click="handleJumpTo(logType.name)"
      >
        {{ logType.name }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.log-types-section {
  margin-top: 30px;
}

.section-header {
  margin-bottom: 12px;
}

.section-header span {
  font-size: 0.9em;
  color: #6c757d;
  font-weight: 500;
}

.pills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill-button {
  padding: 12px 24px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 50px;
  font-size: 0.9em;
  font-weight: 500;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  white-space: nowrap;
  display: inline-block;
  text-decoration: none;
}

.pill-button:hover {
  background: #e9ecef;
  border-color: #adb5bd;
  transform: translateY(-1px);
}

.pill-button.filled-pill {
  background: #d4edda;
  border-color: #28a745;
  color: #155724;
  font-weight: 600;
}

.pill-button.filled-pill:hover {
  background: #c3e6cb;
  border-color: #1e7e34;
}

.pill-button.current-pill {
  background: #fff3cd;
  border-color: #ffc107;
  color: #856404;
  font-weight: 600;
}

.pill-button.current-pill:hover {
  background: #ffeaa7;
  border-color: #ffb300;
}
</style>
