<script setup lang="ts">
import { useLogsStore } from "@/stores/Logs";
import { useSettingsStore } from "@/stores/Settings";
import { computed } from "vue";
import { useRouter } from "vue-router";

const logsStore = useLogsStore();
const settingsStore = useSettingsStore();
const router = useRouter();
const logTypes = computed(() => logsStore.logTypes);

// Group by categories toggle - now from settings store
const groupByCategories = computed({
  get: () => settingsStore.settings.groupByCategories,
  set: (value) => settingsStore.setGroupByCategories(value),
});

// Show archived toggle - from settings store
const showArchived = computed({
  get: () => settingsStore.settings.showArchived,
  set: (value) => settingsStore.setShowArchived(value),
});

// Format time ago
const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const logDate = new Date(timestamp);
  const diffInMs = now.getTime() - logDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;

  // For older dates, show the date
  return logDate.toLocaleDateString();
};

// Enhanced log types with category info, last value and time ago
const enhancedLogTypes = computed(() => {
  // Filter items based on showArchived setting
  const filteredLogTypes = showArchived.value
    ? logTypes.value.filter((logType) => logType.archived) // Show only archived when ON
    : logTypes.value.filter((logType) => !logType.archived); // Show only active when OFF

  // First, map all log types with enhanced data
  const enhanced = filteredLogTypes.map((logType) => {
    // Get category info
    const category = logType.category
      ? logsStore.getCategory(logType.category)
      : null;

    // Get aggregates data
    const lastTime = logType.aggrs?.lastTime;
    const lastValue = logType.aggrs?.lastValue;
    const timeAgo = lastTime ? formatTimeAgo(lastTime) : null;

    return {
      ...logType,
      categoryIcon: category?.icon || "category",
      categoryColor: category?.color || "grey",
      categoryName: category?.name || "No Category",
      lastValue,
      timeAgo,
      frequencyDisplay: `1/${logType.frequency}`,
    };
  });

  // Sort: favorites first, then by name
  return enhanced.sort((a, b) => {
    // Favorites come first
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;

    // If both are favorites or both are not, sort by name
    return a.name.localeCompare(b.name);
  });
});

// Grouped log types by category
const groupedLogTypes = computed(() => {
  if (!groupByCategories.value) {
    return null; // Return null when not grouping
  }

  const groups: { [categoryName: string]: typeof enhancedLogTypes.value } = {};

  enhancedLogTypes.value.forEach((logType) => {
    const categoryName = logType.categoryName;
    if (!groups[categoryName]) {
      groups[categoryName] = [];
    }
    groups[categoryName].push(logType);
  });

  // Convert to array and sort categories by name, with "No Category" last
  return Object.entries(groups)
    .sort(([a], [b]) => {
      if (a === "No Category") return 1;
      if (b === "No Category") return -1;
      return a.localeCompare(b);
    })
    .map(([categoryName, items]) => ({
      categoryName,
      categoryIcon: items[0].categoryIcon,
      categoryColor: items[0].categoryColor,
      items: items.sort((a, b) => a.name.localeCompare(b.name)), // Sort items within category
    }));
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

const navigateToEditLogType = (logTypeName: string) => {
  router.push(`/edit-log-type/${encodeURIComponent(logTypeName)}`);
};

const toggleFavorite = (logTypeName: string) => {
  logsStore.toggleFavorite(logTypeName);
};

// Calculate log status based on frequency and last log time
const getLogStatus = (logType: any) => {
  if (!logType.aggrs?.lastTime) {
    return "default"; // No logs yet
  }

  const now = new Date();
  const lastLogDate = new Date(logType.aggrs.lastTime);
  const daysSinceLastLog = Math.floor(
    (now.getTime() - lastLogDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastLog <= logType.frequency) {
    return "green"; // Within frequency period
  } else {
    return "red"; // Overdue
  }
};
</script>

<template>
  <div class="page-container">
    <!-- Controls row -->
    <div class="controls-row">
      <!-- Group by categories toggle -->
      <div class="group-toggle-container">
        <div class="group-toggle">
          <span class="toggle-label">Group by categories</span>
          <q-toggle v-model="groupByCategories" color="primary" size="md" />
        </div>
      </div>

      <!-- Show archived toggle -->
      <div class="show-archived-container">
        <div class="show-archived-toggle">
          <span class="toggle-label-small">View archived</span>
          <q-toggle v-model="showArchived" color="grey-7" size="sm" />
        </div>
      </div>

      <!-- Fill in all button -->
      <div class="fill-in-all-container">
        <button @click="navigateToFillInAll" class="fill-in-all-btn">
          <span class="icon">✨</span>
          <span class="text">Fill in all</span>
        </button>
      </div>
    </div>

    <!-- Log types list -->
    <div class="log-type-list" v-if="!groupByCategories">
      <div
        v-for="logType in enhancedLogTypes"
        :class="['log-type', `log-type-${getLogStatus(logType)}`]"
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
              <div class="log-type-name">
                {{ logType.name }}
                <span v-if="logType.archived" class="archived-label"
                  >Archived</span
                >
              </div>
              <div class="log-type-meta">
                <span class="frequency">{{ logType.frequencyDisplay }}</span>
                <span v-if="logType.timeAgo" class="last-log">
                  {{ logType.timeAgo }}
                </span>
                <span v-else class="no-logs">No logs yet</span>
                <span v-if="logType.lastValue !== undefined" class="last-value">
                  Value: {{ logType.lastValue }}
                </span>
              </div>
            </div>
            <q-btn
              :icon="logType.favorite ? 'star' : 'star_border'"
              :color="logType.favorite ? 'amber' : 'grey-6'"
              size="sm"
              flat
              round
              class="favorite-btn"
              @click.stop="toggleFavorite(logType.name)"
            />
            <q-btn
              icon="edit"
              size="sm"
              flat
              round
              class="edit-btn"
              @click.stop="navigateToEditLogType(logType.name)"
            />
          </div>
          <q-icon name="chevron_right" class="chevron-icon" />
        </div>
      </div>
    </div>

    <!-- Grouped log types list -->
    <div class="grouped-log-type-list" v-else>
      <div v-for="group in groupedLogTypes" class="category-group">
        <div class="category-header">
          <q-icon
            :name="group.categoryIcon"
            :color="group.categoryColor"
            size="md"
            class="category-header-icon"
          />
          <span class="category-name">{{ group.categoryName }}</span>
          <span class="category-count">({{ group.items.length }})</span>
        </div>

        <div class="category-items">
          <div
            v-for="logType in group.items"
            :class="[
              'log-type',
              'grouped-log-type',
              `log-type-${getLogStatus(logType)}`,
            ]"
            @click="navigateToAddLog(logType.name)"
          >
            <div class="log-type-content">
              <div class="left-section">
                <div class="log-type-info">
                  <div class="log-type-name">
                    {{ logType.name }}
                    <span v-if="logType.archived" class="archived-label"
                      >Archived</span
                    >
                  </div>
                  <div class="log-type-meta">
                    <span class="frequency">{{
                      logType.frequencyDisplay
                    }}</span>
                    <span v-if="logType.timeAgo" class="last-log">
                      {{ logType.timeAgo }}
                    </span>
                    <span v-else class="no-logs">No logs yet</span>
                    <span
                      v-if="logType.lastValue !== undefined"
                      class="last-value"
                    >
                      Value: {{ logType.lastValue }}
                    </span>
                  </div>
                </div>
                <q-btn
                  :icon="logType.favorite ? 'star' : 'star_border'"
                  :color="logType.favorite ? 'amber' : 'grey-6'"
                  size="sm"
                  flat
                  round
                  class="favorite-btn"
                  @click.stop="toggleFavorite(logType.name)"
                />
                <q-btn
                  icon="edit"
                  size="sm"
                  flat
                  round
                  class="edit-btn"
                  @click.stop="navigateToEditLogType(logType.name)"
                />
              </div>
              <q-icon name="chevron_right" class="chevron-icon" />
            </div>
          </div>
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

.controls-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  padding: 0 20px;
  margin-bottom: 20px;
}

.fill-in-all-container {
  display: flex;
  justify-content: center;
}

.group-toggle-container {
  display: flex;
  justify-content: center;
}

.group-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-label {
  font-size: 0.95em;
  font-weight: 500;
  color: #555;
}

.show-archived-container {
  display: flex;
  justify-content: center;
}

.show-archived-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f5f5f5;
  border-radius: 8px;
  border: 1px solid #d0d0d0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.toggle-label-small {
  font-size: 0.85em;
  font-weight: 500;
  color: #666;
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

/* Status-based background colors */
.log-type-green {
  background-color: #e8f5e8;
  border-color: #4caf50;
}

.log-type-green:hover {
  background-color: #c8e6c9;
  border-color: #388e3c;
}

.log-type-red {
  background-color: #ffebee;
  border-color: #f44336;
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
  font-weight: 500;
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

/* Grouped view styles */
.grouped-log-type-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.category-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  border: 1px solid #e1e5e9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.category-header-icon {
  font-size: 1.4em;
  opacity: 0.9;
}

.category-name {
  font-size: 1.1em;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.category-count {
  font-size: 0.9em;
  color: #666;
  background: rgba(255, 255, 255, 0.6);
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.category-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 16px;
  padding-left: 16px;
  border-left: 2px solid #e1e5e9;
}

.grouped-log-type {
  margin-left: 16px;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.grouped-log-type .log-type-content {
  padding: 12px 16px;
}

.grouped-log-type .left-section {
  gap: 8px;
}

.grouped-log-type .category-icon {
  display: none; /* Hide category icon for individual items when grouped */
}

/* Responsive design */
@media (max-width: 480px) {
  .controls-row {
    flex-direction: column;
    gap: 12px;
    padding: 0 10px;
    margin-bottom: 16px;
  }

  .fill-in-all-btn {
    min-width: 180px;
    padding: 14px 28px;
    font-size: 1em;
  }

  .fill-in-all-container {
    padding: 0;
  }

  .group-toggle-container {
    padding: 0;
  }

  .group-toggle {
    padding: 10px 20px;
    gap: 10px;
  }

  .toggle-label {
    font-size: 0.9em;
  }

  .show-archived-container {
    padding: 0;
  }

  .show-archived-toggle {
    padding: 8px 16px;
    gap: 8px;
  }

  .toggle-label-small {
    font-size: 0.8em;
  }

  .log-type-name {
    font-size: 1em;
    gap: 6px;
  }

  .archived-label {
    font-size: 0.7em;
    padding: 1px 4px;
  }

  .category-header {
    padding: 10px 12px;
  }

  .category-items {
    margin-left: 12px;
    padding-left: 12px;
  }

  .grouped-log-type {
    margin-left: 12px;
  }
}
</style>
