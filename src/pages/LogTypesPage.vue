<script setup lang="ts">
import { useLogsStore } from "@/stores/Logs";
import { useSettingsStore } from "@/stores/Settings";
import { computed } from "vue";
import { useRouter } from "vue-router";
import FillInAllButton from "@/components/FillInAllButton.vue";
import LogTypeItem from "@/components/LogTypeItem.vue";
import CategoryHeader from "@/components/CategoryHeader.vue";
import { useLogTypes } from "@/composables/useLogTypes";

const logsStore = useLogsStore();
const settingsStore = useSettingsStore();
const router = useRouter();
const { sortedLogTypes, groupedLogTypes } = useLogTypes();

const groupByCategories = computed({
  get: () => settingsStore.settings.groupByCategories,
  set: (value) => settingsStore.setGroupByCategories(value),
});

const showArchived = computed({
  get: () => settingsStore.settings.showArchived,
  set: (value) => settingsStore.setShowArchived(value),
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
      <div class="toggles">
        <q-toggle
          label="Group by categories"
          v-model="groupByCategories"
          color="primary"
          size="md"
        />

        <q-toggle
          label="View archived"
          v-model="showArchived"
          color="grey-7"
          size="md"
        />
      </div>

      <FillInAllButton />
    </div>

    <!-- Log types list -->
    <div class="log-type-list" v-if="!groupByCategories">
      <LogTypeItem
        v-for="logType in sortedLogTypes"
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
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  /* padding: 0 20px; */
  margin-bottom: 20px;
}

.toggles {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.log-type-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  padding-bottom: 12px;
  border-radius: 8px;
}

.category-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-left: 0px;
  padding-left: 10px;
}

/* Responsive design */
@media (max-width: 480px) {
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
    margin-left: 0px;
    padding-left: 10px;
  }
}
</style>
