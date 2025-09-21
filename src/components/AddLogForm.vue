<script setup lang="ts">
import { ref, computed } from "vue";
import type { LogValue, LogType } from "@/types";
import { LOG_TYPES } from "@/constants";
import { useDateValidation } from "@/composables/useDateValidation";
import BooleanInput from "@/components/BooleanInput.vue";
import NumberInput from "@/components/NumberInput.vue";
import CommentInput from "@/components/CommentInput.vue";
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
  updateToday: [logValue: LogValue];
  incrementToday: [delta: number, comment: string];
  updateDate: [date: Date, logValue: LogValue];
  incrementDate: [date: Date, delta: number, comment: string];
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
const showCommentInput = ref(false);
const commentText = ref("");

const toggleComment = () => {
  showCommentInput.value = !showCommentInput.value;
  if (!showCommentInput.value) {
    commentText.value = ""; // Clear content when closing
  }
};

const clearAfterSubmit = () => {
  if (showCommentInput.value) {
    commentText.value = ""; // Clear after adding
  }
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

const handleBooleanUpdateToday = (value: boolean) => {
  emit("updateToday", {
    value,
    timestamp: new Date().toISOString(),
    comment: commentText.value,
  });
  clearAfterSubmit();
};

const handleBooleanUpdateDate = (date: Date, value: boolean) => {
  emit("updateDate", date, {
    value,
    timestamp: date.toISOString(),
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

const handleNumberUpdateToday = (value: number) => {
  emit("updateToday", {
    value,
    timestamp: new Date().toISOString(),
    comment: commentText.value,
  });
  clearAfterSubmit();
};

const handleNumberUpdateDate = (date: Date, value: number) => {
  emit("updateDate", date, {
    value,
    timestamp: date.toISOString(),
    comment: commentText.value,
  });
  clearAfterSubmit();
};

const handleIncrementToday = (delta: number, comment: string) => {
  emit("incrementToday", delta, comment);
  clearAfterSubmit();
};

const handleIncrementDate = (date: Date, delta: number, comment: string) => {
  emit("incrementDate", date, delta, comment);
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
        @update-today="handleBooleanUpdateToday"
        @update-date="handleBooleanUpdateDate"
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
        @update-today="handleNumberUpdateToday"
        @update-date="handleNumberUpdateDate"
        @increment-today="handleIncrementToday"
        @increment-date="handleIncrementDate"
      />
    </div>

    <!-- Comment input component -->
    <CommentInput
      v-if="!hasLogForTargetDate || isEditing || isAdding"
      :show-comment-input="showCommentInput"
      @toggle="toggleComment"
      @update:commentText="commentText = $event"
    />
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
