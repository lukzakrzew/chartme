<script setup lang="ts">
import { useSettingsStore } from "@/stores/Settings";
import { computed } from "vue";
import { useRouter } from "vue-router";
import FillInAllButton from "@/components/FillInAllButton.vue";
import LogTypeItem from "@/components/LogTypeItem.vue";
import CategoryHeader from "@/components/CategoryHeader.vue";
import { useLogTypes } from "@/composables/useLogTypes";

const settingsStore = useSettingsStore();
const router = useRouter();
const { groupedLogTypes } = useLogTypes();

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

const navigateToAddCategory = () => {
  router.push("/add-category");
};

const navigateToEditLogType = (logTypeName: string) => {
  router.push(`/edit-log-type/${encodeURIComponent(logTypeName)}`);
};
</script>

<template>
  <div class="page-container">
    <!-- Controls row -->
    <div class="controls-row">
      <div class="toggles">
        <q-toggle
          label="View archived"
          v-model="showArchived"
          color="grey-7"
          size="md"
        />
      </div>

      <FillInAllButton />
    </div>

    <!-- Grouped log types list -->
    <div class="grouped-log-type-list">
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
          />
        </div>
      </div>
    </div>

    <!-- Floating Action Button (Speed Dial) -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-fab
        color="primary"
        text-color="white"
        icon="add"
        active-icon="close"
        direction="up"
      >
        <q-fab-action
          color="primary"
          text-color="white"
          icon="post_add"
          label="Add Log Type"
          external-label
          label-position="left"
          @click="navigateToAddLogType"
        />
        <q-fab-action
          color="secondary"
          text-color="white"
          icon="category"
          label="Add Category"
          external-label
          label-position="left"
          @click="navigateToAddCategory"
        />
      </q-fab>
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

/* Larger labels for FAB actions */
:deep(.q-fab__label) {
  font-size: 15px;
  padding: 5px 10px;
}

/* Responsive design */
@media (max-width: 480px) {
  .category-items {
    margin-left: 0px;
    padding-left: 10px;
  }
}
</style>
