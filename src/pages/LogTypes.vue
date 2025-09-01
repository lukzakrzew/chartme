<script setup lang="ts">
import { useLogsStore } from "@/stores/Logs";
import { computed } from "vue";
import { useRouter } from "vue-router";

const logsStore = useLogsStore();
const router = useRouter();
const logTypes = computed(() => logsStore.logTypes);

// Enhanced log types with category info and last log date
const enhancedLogTypes = computed(() => {
  return logTypes.value.map((logType) => {
    // Get category info
    const category = logType.category
      ? logsStore.getCategory(logType.category)
      : null;

    // Get last log date
    const logValues = logsStore.getLogValues(logType.name).value;
    const lastLog =
      logValues.length > 0 ? logValues[logValues.length - 1] : null;
    const lastLogDate = lastLog
      ? new Date(lastLog.timestamp).toLocaleDateString()
      : null;

    return {
      ...logType,
      categoryIcon: category?.icon || "category",
      categoryColor: category?.color || "grey",
      lastLogDate,
      frequencyDisplay: `1/${logType.frequency}`,
    };
  });
});

const navigateToAddLog = (logTypeName: string) => {
  router.push(`/log/${logTypeName}`);
};

const navigateToFillInAll = () => {
  router.push("/fill-in-all");
};

const navigateToAddLogType = () => {
  router.push("/add-log-type");
};
</script>

<template>
  <div class="page-container">
    <!-- Fill in all button -->
    <div class="fill-in-all-container">
      <button @click="navigateToFillInAll" class="fill-in-all-btn">
        <span class="icon">✨</span>
        <span class="text">Fill in all</span>
      </button>
    </div>

    <!-- Log types list -->
    <div class="log-type-list">
      <div
        v-for="logType in enhancedLogTypes"
        class="log-type"
        @click="navigateToAddLog(logType.name)"
      >
        <div class="log-type-content">
          <div class="left-section">
            <q-icon
              :name="logType.categoryIcon"
              :color="logType.categoryColor"
              size="md"
              class="category-icon"
            />
            <div class="log-type-info">
              <div class="log-type-name">{{ logType.name }}</div>
              <div class="log-type-meta">
                <span class="frequency">{{ logType.frequencyDisplay }}</span>
                <span v-if="logType.lastLogDate" class="last-log">
                  Last: {{ logType.lastLogDate }}
                </span>
                <span v-else class="no-logs">No logs yet</span>
              </div>
            </div>
          </div>
          <q-icon name="chevron_right" class="chevron-icon" />
        </div>
      </div>
    </div>

    <!-- Floating Action Button -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" @click="navigateToAddLogType" />
    </q-page-sticky>
  </div>
</template>

<style scoped>
.page-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.fill-in-all-container {
  display: flex;
  justify-content: center;
  padding: 0 20px;
}

.fill-in-all-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  min-width: 200px;
  justify-content: center;
}

.fill-in-all-btn:hover {
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.fill-in-all-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.4);
}

.fill-in-all-btn .icon {
  font-size: 1.3em;
  transition: transform 0.3s ease;
}

.fill-in-all-btn:hover .icon {
  animation: sparkle 0.6s ease-in-out;
}

.fill-in-all-btn .text {
  letter-spacing: 0.5px;
}

@keyframes sparkle {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.1) rotate(180deg);
    opacity: 0.8;
  }
}

.log-type-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.log-type {
  border: 1px solid #eee;
  padding: 16px;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  background-color: #fafafa;
}

.log-type:hover {
  background-color: #f0f0f0;
  border-color: #d0d0d0;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

.log-type-info {
  flex: 1;
  min-width: 0;
}

.log-type-name {
  font-size: 1.1em;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
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

.chevron-icon {
  color: #ccc;
  font-size: 1.2em;
  transition: color 0.2s ease;
}

.log-type:hover .chevron-icon {
  color: #666;
}

/* Responsive design */
@media (max-width: 480px) {
  .fill-in-all-btn {
    min-width: 180px;
    padding: 14px 28px;
    font-size: 1em;
  }

  .fill-in-all-container {
    padding: 0 10px;
  }
}
</style>
