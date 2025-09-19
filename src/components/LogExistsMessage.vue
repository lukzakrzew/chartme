<script setup lang="ts">
import type { LogValue } from "@/types";
import ValueDisplay from "@/components/ValueDisplay.vue";
import { isDate } from "@/helpers/dateUtils";
import { computed } from "vue";

interface Props {
  selectedDate?: Date;
  logTypeName: string;
  isNumberType: boolean;
  logValues: LogValue[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  edit: [];
  add: [];
}>();

// Find the value for the target date
const targetDateValue = computed((): any => {
  const targetDate = props.selectedDate || new Date();
  const logForDate = props.logValues.find((log: LogValue) =>
    isDate(log.timestamp, targetDate)
  );
  return logForDate ? logForDate.value : null;
});

const handleEdit = () => {
  emit("edit");
};

const handleAdd = () => {
  emit("add");
};
</script>

<template>
  <div class="target-date-log-exists-message">
    <div class="message-content">
      <p v-if="!selectedDate">You've already logged a value for today!</p>
      <p v-else>
        You've already logged a value for
        {{ selectedDate.toLocaleDateString() }}!
      </p>

      <div v-if="targetDateValue !== null" class="value-display">
        <span class="value-label">Value: </span>
        <ValueDisplay :value="targetDateValue" />
      </div>

      <div class="today-actions">
        <q-btn
          icon="edit"
          round
          flat
          size="md"
          aria-label="Edit today"
          @click="handleEdit"
        />
        <q-btn
          v-if="isNumberType"
          icon="add"
          round
          flat
          size="md"
          aria-label="Add to today"
          @click="handleAdd"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Target date log exists message styling */
.target-date-log-exists-message,
.today-log-exists-message {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 20px;
}

.message-content {
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 30px;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.message-content p {
  margin: 0;
  font-size: 1.2em;
  color: #28a745;
  font-weight: 600;
}

.value-display {
  margin: 12px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.value-label {
  font-size: 1.1em;
  color: #495057;
  font-weight: 500;
}

/* Today actions styling (Edit/Add buttons) */
.today-actions {
  margin-top: 16px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.today-actions :deep(.q-btn) {
  opacity: 0.8;
  transition: all 0.2s ease;
}

.today-actions :deep(.q-btn):hover {
  opacity: 1;
  transform: scale(1.1);
}

/* Responsive adjustments for smaller screens */
@media (max-width: 480px) {
  .message-content {
    padding: 20px;
    max-width: 300px;
  }

  .message-content p {
    font-size: 1.1em;
  }
}
</style>
