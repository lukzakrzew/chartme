<script setup lang="ts">
import { isLogTypeFilledRecentlyUtil } from "@/composables/useUnfilledLogTypes";
import type { LogType } from "@/types";

interface EnhancedLogType {
  name: string;
  type: string;
  frequency: number;
  archived: boolean;
  favorite: boolean;
  categoryIcon: string;
  categoryColor: string;
  categoryName: string;
  lastValue: any;
  timeAgo: string | null;
  frequencyDisplay: string;
  aggrs?: {
    lastTime?: string;
    lastValue?: any;
  };
}

interface Props {
  logType: EnhancedLogType;
  isGrouped?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  navigateToAddLog: [logTypeName: string];
  navigateToEditLogType: [logTypeName: string];
  toggleFavorite: [logTypeName: string];
}>();

const navigateToAddLog = () => {
  emit("navigateToAddLog", props.logType.name);
};

const navigateToEditLogType = () => {
  emit("navigateToEditLogType", props.logType.name);
};

const toggleFavorite = () => {
  emit("toggleFavorite", props.logType.name);
};

// Convert EnhancedLogType to LogType for utility function compatibility
const convertToLogType = (enhanced: EnhancedLogType): LogType => ({
  name: enhanced.name,
  type: enhanced.type as any,
  desc: "",
  frequency: enhanced.frequency,
  oneToTen: false,
  favorite: enhanced.favorite,
  archived: enhanced.archived,
  category: enhanced.categoryName,
  aggrs: enhanced.aggrs || {},
});

const getLogStatus = (logType: EnhancedLogType) => {
  if (logType.archived) {
    return "default"; // Don't show status for archived items
  }

  // Convert to LogType format and use the utility function
  const logTypeObj = convertToLogType(logType);
  const isFilled = isLogTypeFilledRecentlyUtil(logTypeObj);

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
          :name="logType.categoryIcon"
          :color="logType.categoryColor"
          size="md"
          class="category-icon"
        />

        <div class="log-type-info">
          <div class="log-type-name">
            {{ logType.name }}
            <span v-if="logType.archived" class="archived-label">Archived</span>
          </div>
          <div class="log-type-meta">
            <span class="frequency">{{ logType.frequencyDisplay }}</span>
            <span v-if="logType.timeAgo" class="last-log">
              {{ logType.timeAgo }}
            </span>
            <span v-else class="no-logs">No logs yet</span>
            <span v-if="logType.lastValue !== undefined" class="last-value">
              {{ logType.lastValue }}
            </span>
          </div>
        </div>

        <!-- Action buttons -->
        <q-btn
          :icon="logType.favorite ? 'star' : 'star_border'"
          :color="logType.favorite ? 'amber' : 'grey-6'"
          size="sm"
          flat
          round
          class="favorite-btn"
          @click.stop="toggleFavorite"
        />
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

.favorite-btn {
  opacity: 0.7;
  transition: all 0.2s ease;
  margin-right: 4px;
}

.favorite-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.edit-btn {
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.edit-btn:hover {
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

.last-value {
  background-color: #f3e5f5;
  color: #7b1fa2;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
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
