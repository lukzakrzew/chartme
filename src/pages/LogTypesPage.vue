<script setup lang="ts">
import { useSettingsStore } from "@/stores/Settings";
import { useLogsStore } from "@/stores/Logs";
import { computed } from "vue";
import { useRouter } from "vue-router";
import FillInAllButton from "@/components/FillInAllButton.vue";
import LogTypeItem from "@/components/LogTypeItem.vue";
import CategoryHeader from "@/components/CategoryHeader.vue";
import { useLogTypes, type CategoryGroup } from "@/composables/useLogTypes";

const settingsStore = useSettingsStore();
const logsStore = useLogsStore();
const router = useRouter();
const { groupedLogTypes } = useLogTypes();

const showArchived = computed({
  get: () => settingsStore.settings.showArchived,
  set: (value) => settingsStore.setShowArchived(value),
});

const changeOrder = computed({
  get: () => settingsStore.changeOrder,
  set: (value) => (settingsStore.changeOrder = value),
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

const moveLogTypeUp = (logTypeName: string) => {
  console.log("moveLogTypeUp", logTypeName);
  const logType = logsStore.getLogType(logTypeName);
  if (!logType) throw new Error(`Log type ${logTypeName} not found`);

  // Find the group this log type belongs to
  const group = groupedLogTypes.value.find((g) =>
    g.items.some((item) => item.name === logTypeName)
  );
  if (!group) throw new Error(`Group for log type ${logTypeName} not found`);

  // Initialize order values if this is the first reorder operation in this category
  const hasOrderValues = group.items.every((item) => item.order !== undefined);
  if (!hasOrderValues) {
    initializeOrderValues(group);
  }

  // Find the current index in the sorted items
  const currentIndex = group.items.findIndex(
    (item) => item.name === logTypeName
  );
  if (currentIndex <= 0) return; // Can't move up if already at top

  const currentItem = group.items[currentIndex];
  const itemAbove = group.items[currentIndex - 1];

  // Swap order values
  const tempOrder = currentItem.order;
  const updatedCurrentItem = { ...currentItem, order: itemAbove.order };
  const updatedItemAbove = { ...itemAbove, order: tempOrder };

  logsStore.updateLogType(currentItem.name, updatedCurrentItem);
  logsStore.updateLogType(itemAbove.name, updatedItemAbove);
};

const moveLogTypeDown = (logTypeName: string) => {
  const logType = logsStore.getLogType(logTypeName);
  if (!logType) return;

  // Find the group this log type belongs to
  const group = groupedLogTypes.value.find((g) =>
    g.items.some((item) => item.name === logTypeName)
  );
  if (!group) return;

  // Initialize order values if this is the first reorder operation in this category
  const hasOrderValues = group.items.every((item) => item.order !== undefined);
  if (!hasOrderValues) {
    initializeOrderValues(group);
  }

  // Find the current index in the sorted items
  const currentIndex = group.items.findIndex(
    (item) => item.name === logTypeName
  );
  if (currentIndex >= group.items.length - 1) return; // Can't move down if already at bottom

  const currentItem = group.items[currentIndex];
  const itemBelow = group.items[currentIndex + 1];

  // Swap order values
  const tempOrder = currentItem.order;
  const updatedCurrentItem = { ...currentItem, order: itemBelow.order };
  const updatedItemBelow = { ...itemBelow, order: tempOrder };

  logsStore.updateLogType(currentItem.name, updatedCurrentItem);
  logsStore.updateLogType(itemBelow.name, updatedItemBelow);
};

const initializeOrderValues = (group: CategoryGroup) => {
  // Assign sequential order values to all items in the category
  group.items.forEach((item, index) => {
    const updatedItem = { ...item, order: index };
    console.log("initializeOrderValues", updatedItem.name, updatedItem.order);
    logsStore.updateLogType(item.name, updatedItem);
  });
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
        <q-toggle
          label="Change order"
          v-model="changeOrder"
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
            @move-up="moveLogTypeUp"
            @move-down="moveLogTypeDown"
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
