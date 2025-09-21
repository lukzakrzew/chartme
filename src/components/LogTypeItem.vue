<script setup lang="ts">
import { isLogTypeFilledRecently } from "@/composables/useUnfilledLogTypes";
import type { LogType } from "@/types";
import { computed } from "vue";
import { useLogsStore } from "@/stores/Logs";
import { useSettingsStore } from "@/stores/Settings";
import { formatTimeAgo } from "@/helpers/timeFormatter";
import ValueDisplay from "./ValueDisplay.vue";

interface Props {
  logType: LogType;
  isGrouped?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  navigateToAddLog: [logTypeName: string];
  navigateToEditLogType: [logTypeName: string];
  moveUp: [logTypeName: string];
  moveDown: [logTypeName: string];
}>();

const logsStore = useLogsStore();
const settingsStore = useSettingsStore();
const changeOrder = computed(() => settingsStore.changeOrder);

const category = computed(() =>
  props.logType.category ? logsStore.getCategory(props.logType.category) : null
);

const categoryIcon = computed(() => category.value?.icon || "category");
const categoryColor = computed(() => category.value?.color || "grey");

const lastValue = computed(() => props.logType.aggrs?.lastValue);

const timeAgo = computed(() =>
  props.logType.aggrs?.lastTime
    ? formatTimeAgo(props.logType.aggrs.lastTime)
    : null
);

const frequencyDisplay = computed(() => `1/${props.logType.frequency}`);

const navigateToAddLog = () => {
  emit("navigateToAddLog", props.logType.name);
};

const navigateToEditLogType = () => {
  emit("navigateToEditLogType", props.logType.name);
};

const moveUp = () => {
  emit("moveUp", props.logType.name);
};

const moveDown = () => {
  emit("moveDown", props.logType.name);
};

// Convert LogType for utility function compatibility
const getLogStatus = (logType: LogType) => {
  if (logType.archived) {
    return "default"; // Don't show status for archived items
  }

  // Convert to LogType format and use the utility function
  const logTypeObj = logType;
  const isFilled = isLogTypeFilledRecently(logTypeObj);

  return isFilled ? "green" : "red";
};
</script>

<template>
  <div
    :class="[
      'log-type',
      props.isGrouped ? 'grouped-log-type' : '',
      `log-type-${getLogStatus(logType)}`,
    ]"
    @click="navigateToAddLog"
  >
    <div class="log-type-content">
      <div class="left-section">
        <!-- Category icon - only show when not grouped -->
        <q-icon
          v-if="!props.isGrouped"
          :name="categoryIcon"
          :color="categoryColor"
          size="md"
          class="category-icon"
        />

        <div class="log-type-info">
          <div class="log-type-name">
            {{ logType.name }}
            <span v-if="logType.archived" class="archived-label">Archived</span>
          </div>
          <div class="log-type-meta">
            <span class="frequency">{{ frequencyDisplay }}</span>
            <span class="order-display">Order: {{ logType.order }}</span>
            <span v-if="timeAgo" class="last-log">
              {{ timeAgo }}
            </span>
            <span v-else class="no-logs">No logs yet</span>
            <ValueDisplay v-if="lastValue !== undefined" :value="lastValue" />
          </div>
        </div>

        <!-- Action buttons -->
        <div v-if="changeOrder" class="order-buttons">
          <q-btn
            icon="keyboard_arrow_up"
            size="sm"
            flat
            round
            class="order-btn"
            @click.stop="moveUp"
          />
          <q-btn
            icon="keyboard_arrow_down"
            size="sm"
            flat
            round
            class="order-btn"
            @click.stop="moveDown"
          />
        </div>
        <q-btn
          icon="edit"
          size="sm"
          flat
          round
          class="edit-btn"
          @click.stop="navigateToEditLogType"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.log-type {
  border: 1px solid #eee;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  background-color: #fafafa;
  margin-left: 0;
  margin-right: 8px;
}

.log-type:hover {
  background-color: #f0f0f0;
  border-color: #d0d0d0;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Status-based background colors */
.log-type-green {
  border-color: #4caf50 !important;
}

.log-type-green:hover {
  background-color: #c8e6c9;
  border-color: #388e3c;
}

.log-type-red {
  border-color: #e7c8c6 !important;
}

.log-type-red:hover {
  background-color: #ffcdd2;
  border-color: #d32f2f;
}

/* Name color when not filled */
.log-type-red .log-type-name {
  color: #b95656;
}

.log-type-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.category-icon {
  font-size: 1.5em;
  opacity: 0.8;
}

.edit-btn {
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.edit-btn:hover {
  opacity: 1;
}

.order-buttons {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.order-btn {
  opacity: 0.6;
  transition: opacity 0.2s ease;
  padding: 4px;
}

.order-btn:hover {
  opacity: 1;
}

.log-type-info {
  flex: 1;
  min-width: 0;
}

.log-type-name {
  font-size: 1.1em;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.archived-label {
  font-size: 0.75em;
  font-weight: 600;
  color: #ff9800;
  background-color: #fff3e0;
  padding: 2px 6px;
  border-radius: 8px;
  border: 1px solid #ffcc02;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.log-type-meta {
  display: flex;
  gap: 12px;
  font-size: 0.85em;
  color: #666;
  flex-wrap: wrap;
  align-items: center;
}

.frequency {
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.last-log {
  color: #4caf50;
}

.no-logs {
  color: #ff9800;
  font-style: italic;
}

.chevron-icon {
  color: #ccc;
  font-size: 1.2em;
  transition: color 0.2s ease;
}

.log-type:hover .chevron-icon {
  color: #666;
}

/* Grouped styles */
.grouped-log-type {
  margin-left: 0px;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.grouped-log-type .log-type-content {
  padding: 0px 16px;
}

.grouped-log-type .left-section {
  gap: 8px;
}

.grouped-log-type .category-icon {
  display: none; /* Hide category icon for individual items when grouped */
}

/* Responsive design */
@media (max-width: 480px) {
  .log-type-name {
    font-size: 1em;
    gap: 6px;
  }

  .archived-label {
    font-size: 0.7em;
    padding: 1px 4px;
  }
}
</style>
