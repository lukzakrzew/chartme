<script setup lang="ts">
import { computed } from "vue";
import { useLogTypes } from "@/composables/useLogTypes";
import { useLogsStore } from "@/stores/Logs";
import { NO_CATEGORY } from "@/constants";

interface Props {
  currentLogTypeName: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  change: [logTypeName: string];
}>();

const logsStore = useLogsStore();
const { sortedLogTypes, getNextLogType, getPreviousLogType } = useLogTypes();

// Options for the dropdown with category icons
const dropdownOptions = computed(() =>
  sortedLogTypes.value.map((logType) => {
    const category = logType.category
      ? logsStore.getCategory(logType.category)
      : null;
    const categoryName = logType.category
      ? logsStore.getCategory(logType.category)?.name || NO_CATEGORY
      : NO_CATEGORY;

    return {
      label: logType.name,
      value: logType.name,
      categoryIcon: category?.icon || "category",
      categoryColor: category?.color || "grey",
      categoryName,
    };
  })
);

// Check if navigation buttons should be enabled
const canGoToNextLogType = computed(
  () => getNextLogType(props.currentLogTypeName) !== null
);
const canGoToPreviousLogType = computed(
  () => getPreviousLogType(props.currentLogTypeName) !== null
);

// Get the currently selected option for display
const selectedOption = computed(() =>
  dropdownOptions.value.find(
    (option) => option.value === props.currentLogTypeName
  )
);

const goToNextLogType = () => {
  const nextLogType = getNextLogType(props.currentLogTypeName);
  if (nextLogType) {
    emit("change", nextLogType.name);
  }
};

const goToPreviousLogType = () => {
  const prevLogType = getPreviousLogType(props.currentLogTypeName);
  if (prevLogType) {
    emit("change", prevLogType.name);
  }
};

const onLogTypeChange = (newLogTypeName: string) => {
  if (newLogTypeName && newLogTypeName !== props.currentLogTypeName) {
    emit("change", newLogTypeName);
  }
};
</script>

<template>
  <div class="log-type-switcher">
    <q-btn
      flat
      round
      icon="chevron_left"
      :disable="!canGoToPreviousLogType"
      @click="goToPreviousLogType"
      class="nav-icon-btn"
    />
    <q-select
      :model-value="currentLogTypeName"
      :options="dropdownOptions"
      @update:model-value="onLogTypeChange"
      outlined
      emit-value
      map-options
      class="log-type-dropdown"
      :option-value="'value'"
      :option-label="'label'"
      placeholder="Select log type"
    >
      <template v-slot:selected-item="scope">
        <div class="selected-item-content">
          <q-icon
            v-if="selectedOption"
            :name="selectedOption.categoryIcon"
            :color="selectedOption.categoryColor"
            size="sm"
            class="selected-item-icon"
          />
          <span class="selected-item-text">{{ scope.opt.label }}</span>
        </div>
      </template>

      <template v-slot:option="{ itemProps, opt }">
        <q-item v-bind="itemProps">
          <q-item-section avatar>
            <q-icon
              :name="opt.categoryIcon"
              :color="opt.categoryColor"
              size="sm"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ opt.label }}</q-item-label>
            <q-item-label caption>{{ opt.categoryName }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
    <q-btn
      flat
      round
      icon="chevron_right"
      :disable="!canGoToNextLogType"
      @click="goToNextLogType"
      class="nav-icon-btn"
    />
  </div>
</template>

<style scoped>
.log-type-switcher {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  margin-bottom: 0;
}

.nav-icon-btn {
  width: 40px;
  height: 40px;
}

.log-type-dropdown {
  min-width: 200px;
  max-width: 300px;
}

/* Center the selected value text in the dropdown */
.log-type-dropdown :deep(.q-field__native) {
  text-align: center;
}

/* Style the selected item content with icon */
.selected-item-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.selected-item-icon {
  flex-shrink: 0;
}

.selected-item-text {
  text-align: center;
  flex: 1;
}
.selected-item-icon {
  margin-right: 32px;
}
</style>
