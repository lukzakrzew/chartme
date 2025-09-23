<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import type { LogValue } from "@/types";
import ValueDisplay from "@/components/ValueDisplay.vue";
import { isDate, getTodayDateString, getDateString } from "@/helpers/dateUtils";

interface Props {
  logValues: LogValue[];
  oneToTen: boolean;
  isEditing: boolean;
  isAdding: boolean;
  selectedDate?: Date;
  commentText: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  submit: [value: number];
  update: [date: Date | null, value: number];
  increment: [date: Date | null, delta: number, comment: string];
  "update:commentText": [value: string];
}>();

// Number input functionality
const numberInput = ref<number | null>(null);
const numberInputRef = ref<HTMLInputElement | null>(null);

// Computed properties for today's value display
const isSelectedDateToday = computed((): boolean => {
  if (!props.selectedDate) return true; // No selected date means today
  return getDateString(props.selectedDate) === getTodayDateString();
});

const todaysValue = computed((): any => {
  if (!isSelectedDateToday.value) return null;
  const targetDate = props.selectedDate || new Date();
  const logForDate = props.logValues.find((log: LogValue) =>
    isDate(log.timestamp, targetDate)
  );
  return logForDate ? logForDate.value : null;
});

const submitNumber = () => {
  if (numberInput.value !== null && numberInput.value !== undefined) {
    if (props.isAdding) {
      emit(
        "increment",
        props.selectedDate || null,
        Number(numberInput.value),
        props.commentText
      );
    } else {
      const value = Number(numberInput.value);
      if (props.isEditing) {
        emit("update", props.selectedDate || null, value);
      } else {
        emit("submit", value);
      }
    }
    numberInput.value = null; // Clear input
  }
};

const updateComment = (value: string) => {
  emit("update:commentText", value);
};

// Auto-focus the input when component mounts
onMounted(() => {
  if (numberInputRef.value) {
    numberInputRef.value.focus();
  }
});
</script>

<template>
  <div class="log-type-number">
    <!-- Show current value when date is today -->
    <div
      v-if="isSelectedDateToday && todaysValue !== null"
      class="current-value-section"
    >
      <span class="value-label">Current value: </span>
      <ValueDisplay :value="todaysValue" />
    </div>

    <div class="number-input-section">
      <input
        ref="numberInputRef"
        v-model.number="numberInput"
        type="number"
        :placeholder="isAdding ? 'Increment by...' : 'Enter a number...'"
        class="number-input"
        @keyup.enter="submitNumber"
      />
      <button @click="submitNumber" class="submit-btn">Submit</button>
    </div>

    <!-- Comment textarea - always visible -->
    <div class="comment-section">
      <textarea
        :value="commentText"
        placeholder="Add a comment for this log entry..."
        rows="3"
        class="comment-textarea"
        @input="updateComment(($event.target as HTMLTextAreaElement).value)"
      ></textarea>
    </div>
  </div>
</template>

<style scoped>
/* Number input styling */
.log-type-number {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

.number-input-section {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
  max-width: 300px;
}

.number-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1em;
  text-align: center;
}

.number-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.submit-btn {
  padding: 10px 20px;
  border: 1px solid #007bff;
  background-color: white;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9em;
}

.submit-btn:hover {
  background-color: #007bff;
  color: white;
}

/* Comment section styling */
.comment-section {
  margin-top: 15px;
  width: 100%;
  max-width: 300px;
}

.comment-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  font-size: 0.9em;
  min-height: 60px;
}

.comment-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

/* Current value display styling */
.current-value-section {
  margin-bottom: 15px;
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

/* Responsive adjustments for smaller screens */
@media (max-width: 480px) {
  .number-buttons {
    grid-template-columns: repeat(4, 1fr);
  }

  .number-input {
    width: 100%;
  }
}
</style>
