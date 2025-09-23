<script setup lang="ts">
import { ref, computed } from "vue";
import type { LogValue, LogType } from "@/types";
import { LOG_TYPES } from "@/constants";
import { useDateValidation } from "@/composables/useDateValidation";
import BooleanInput from "@/components/BooleanInput.vue";
import NumberInput from "@/components/NumberInput.vue";
import LogExistsMessage from "@/components/LogExistsMessage.vue";

interface Props {
  logType: LogType;
  logValues: LogValue[];
  hasLogForToday: boolean;
  selectedDate?: Date;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  submit: [logValue: LogValue];
  update: [date: Date | null, logValue: LogValue];
  increment: [date: Date | null, delta: number, comment: string];
}>();

// Use the date validation composable
const { hasLogForTargetDate } = useDateValidation(
  computed(() => props.logValues),
  computed(() => props.selectedDate)
);

// UI state
const isEditing = ref(false);
const isAdding = ref(false);

// Comment functionality
const commentText = ref("");

const clearAfterSubmit = () => {
  commentText.value = ""; // Clear after adding
  isEditing.value = false;
  isAdding.value = false;
};

const handleBooleanSubmit = (value: boolean) => {
  emit("submit", {
    value,
    timestamp: props.selectedDate
      ? props.selectedDate.toISOString()
      : new Date().toISOString(),
    comment: commentText.value,
  });
  clearAfterSubmit();
};

const handleBooleanUpdate = (date: Date | null, value: boolean) => {
  const targetDate = date || new Date();
  emit("update", date, {
    value,
    timestamp: targetDate.toISOString(),
    comment: commentText.value,
  });
  clearAfterSubmit();
};

const handleNumberSubmit = (value: number) => {
  emit("submit", {
    value,
    timestamp: props.selectedDate
      ? props.selectedDate.toISOString()
      : new Date().toISOString(),
    comment: commentText.value,
  });
  clearAfterSubmit();
};

const handleNumberUpdate = (date: Date | null, value: number) => {
  const targetDate = date || new Date();
  emit("update", date, {
    value,
    timestamp: targetDate.toISOString(),
    comment: commentText.value,
  });
  clearAfterSubmit();
};

const handleIncrement = (date: Date | null, delta: number, comment: string) => {
  emit("increment", date, delta, comment);
  clearAfterSubmit();
};

const handleEdit = () => {
  isEditing.value = !isEditing.value;
  isAdding.value = false;
};

const handleAdd = () => {
  isAdding.value = !isAdding.value;
  isEditing.value = false;
};
</script>

<template>
  <div>
    <h4>
      {{ logType.name }}
      <span v-if="selectedDate" class="date-display">
        - {{ selectedDate.toLocaleDateString() }}
      </span>
    </h4>

    <!-- Show message when log for target date already exists -->
    <LogExistsMessage
      v-if="hasLogForTargetDate && !isEditing && !isAdding"
      :selected-date="selectedDate"
      :log-type-name="logType.name"
      :is-number-type="logType.type === LOG_TYPES.number"
      :log-values="logValues"
      @edit="handleEdit"
      @add="handleAdd"
    />

    <!-- Input controls: show normally if no log for target date; if target date exists, show when editing or adding -->
    <div v-if="!hasLogForTargetDate || isEditing || isAdding" class="log-value">
      <!-- Boolean type: YES/NO buttons -->
      <BooleanInput
        v-if="logType.type === LOG_TYPES.boolean"
        :is-editing="isEditing"
        :is-adding="isAdding"
        :selected-date="selectedDate"
        @submit="handleBooleanSubmit"
        @update="handleBooleanUpdate"
      />

      <!-- Number type: Input and quick buttons -->
      <NumberInput
        v-else-if="logType.type === LOG_TYPES.number"
        :log-values="logValues"
        :one-to-ten="logType.oneToTen"
        :is-editing="isEditing"
        :is-adding="isAdding"
        :selected-date="selectedDate"
        :comment-text="commentText"
        @submit="handleNumberSubmit"
        @update="handleNumberUpdate"
        @increment="handleIncrement"
        @update:commentText="commentText = $event"
      />
    </div>
  </div>
</template>

<style scoped>
h4 {
  text-align: center;
  margin-bottom: 20px;
}

.date-display {
  color: #666;
  font-weight: normal;
  font-size: 0.4em;
  opacity: 0.7;
}

.log-value {
  margin-bottom: 15px;
}
</style>
