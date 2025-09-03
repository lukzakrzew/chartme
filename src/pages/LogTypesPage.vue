<script setup lang="ts">
import { useLogsStore } from "@/stores/Logs";
import { useSettingsStore } from "@/stores/Settings";
import { computed } from "vue";
import { useRouter } from "vue-router";
import FillInAllButton from "@/components/FillInAllButton.vue";
import LogTypeItem from "@/components/LogTypeItem.vue";
import CategoryHeader from "@/components/CategoryHeader.vue";

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

const navigateToAddLogType = () => {
  router.push("/add-log-type");
};

const navigateToEditLogType = (logTypeName: string) => {
  router.push(`/edit-log-type/${encodeURIComponent(logTypeName)}`);
};

const toggleFavorite = (logTypeName: string) => {
  logsStore.toggleFavorite(logTypeName);
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
      <FillInAllButton />
    </div>

    <!-- Log types list -->
    <div class="log-type-list" v-if="!groupByCategories">
      <LogTypeItem
        v-for="logType in enhancedLogTypes"
        :key="logType.name"
        :log-type="logType"
        :is-grouped="false"
        @navigate-to-add-log="navigateToAddLog"
        @navigate-to-edit-log-type="navigateToEditLogType"
        @toggle-favorite="toggleFavorite"
      />
    </div>

    <!-- Grouped log types list -->
    <div class="grouped-log-type-list" v-else>
      <div v-for="group in groupedLogTypes" class="category-group">
        <CategoryHeader :group="group" />

        <div class="category-items">
          <LogTypeItem
            v-for="logType in group.items"
            :key="logType.name"
            :log-type="logType"
            :is-grouped="true"
            @navigate-to-add-log="navigateToAddLog"
            @navigate-to-edit-log-type="navigateToEditLogType"
            @toggle-favorite="toggleFavorite"
          />
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

.category-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 16px;
  padding-left: 16px;
  border-left: 2px solid #e1e5e9;
}

/* Responsive design */
@media (max-width: 480px) {
  .controls-row {
    flex-direction: column;
    gap: 12px;
    padding: 0 10px;
    margin-bottom: 16px;
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

  .category-items {
    margin-left: 12px;
    padding-left: 12px;
  }

  .grouped-log-type {
    margin-left: 12px;
  }
}
</style>
