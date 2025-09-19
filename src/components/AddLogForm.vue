<script setup lang="ts">
import { computed, ref } from "vue";
import type { LogValue, LogType } from "@/types";
import { LOG_TYPES } from "@/constants";

interface Props {
  logType: LogType;
  logValues: LogValue[];
  hasLogForToday: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  submit: [logValue: LogValue];
  updateToday: [logValue: LogValue];
  incrementToday: [delta: number, comment: string];
}>();

// Reactive computed for number buttons based on oneToTen setting and last logged value
const computedNumberButtons = computed((): number[] => {
  // If oneToTen is true, always show buttons from 1 to 10
  if (props.logType.oneToTen) {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }

  // If oneToTen is false, show 4 less, last value, and 4 more
  if (!props.logValues || props.logValues.length === 0) {
    // Default values if no logs exist: show 1-10 but shifted to avoid 0
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }

  // Find the last numeric value
  const lastNumericValue = props.logValues
    .slice()
    .reverse()
    .find((log: LogValue) => typeof log.value === "number");

  const baseValue = lastNumericValue ? (lastNumericValue.value as number) : 5;

  // Create buttons: 4 less, base value, 5 greater
  // If there aren't 4 less (would go below 0), add more greater values
  const buttons: number[] = [];
  const minValue = Math.max(0, baseValue - 4);

  // If we had to adjust minValue up, add extra values to the higher end
  const adjustment = baseValue - 4 - minValue;
  const maxValue = baseValue + 5 + adjustment;

  for (let i = minValue; i <= maxValue; i++) {
    buttons.push(i);
  }

  // Remove duplicates (in case of edge cases) and sort
  const uniqueButtons = [...new Set(buttons)].sort((a, b) => a - b);

  return uniqueButtons;
});

// UI state
const isEditing = ref(false);
const isAdding = ref(false);

// Comment functionality
const showCommentInput = ref(false);
const commentText = ref("");

// Number input functionality
const numberInput = ref<number | null>(null);

const toggleComment = () => {
  showCommentInput.value = !showCommentInput.value;
  if (!showCommentInput.value) {
    commentText.value = ""; // Clear content when closing
  }
};

const createLogValue = (value: boolean | number): LogValue => {
  return {
    value,
    timestamp: new Date().toISOString(),
    comment: showCommentInput.value ? commentText.value : "",
  };
};

const clearAfterSubmit = () => {
  if (showCommentInput.value) {
    commentText.value = ""; // Clear after adding
  }
  isEditing.value = false;
  isAdding.value = false;
};

const clickYes = () => {
  const logValue = createLogValue(true);
  if (isEditing.value) {
    emit("updateToday", logValue);
  } else {
    emit("submit", logValue);
  }
  clearAfterSubmit();
};

const clickNo = () => {
  const logValue = createLogValue(false);
  if (isEditing.value) {
    emit("updateToday", logValue);
  } else {
    emit("submit", logValue);
  }
  clearAfterSubmit();
};

// Number input handlers
const submitNumber = () => {
  if (numberInput.value !== null && numberInput.value !== undefined) {
    if (isAdding.value) {
      emit(
        "incrementToday",
        Number(numberInput.value),
        showCommentInput.value ? commentText.value : ""
      );
    } else {
      const logValue = createLogValue(Number(numberInput.value));
      if (isEditing.value) {
        emit("updateToday", logValue);
      } else {
        emit("submit", logValue);
      }
    }
    numberInput.value = null; // Clear input
    clearAfterSubmit();
  }
};

const clickNumberButton = (value: number) => {
  if (isAdding.value) {
    emit(
      "incrementToday",
      value,
      showCommentInput.value ? commentText.value : ""
    );
  } else {
    const logValue = createLogValue(value);
    if (isEditing.value) {
      emit("updateToday", logValue);
    } else {
      emit("submit", logValue);
    }
  }
  clearAfterSubmit();
};
</script>

<template>
  <div>
    <h4>{{ logType.name }}</h4>

    <!-- Show message when log for today already exists -->
    <div
      v-if="hasLogForToday && !isEditing && !isAdding"
      class="today-log-exists-message"
    >
      <div class="message-content">
        <p>You've already logged a value for today!</p>

        <div class="today-actions">
          <q-btn
            icon="edit"
            round
            flat
            size="md"
            aria-label="Edit today"
            @click="
              isEditing = !isEditing;
              isAdding = false;
            "
          />
          <q-btn
            v-if="logType.type === LOG_TYPES.number"
            icon="add"
            round
            flat
            size="md"
            aria-label="Add to today"
            @click="
              isAdding = !isAdding;
              isEditing = false;
            "
          />
        </div>
      </div>
    </div>

    <!-- Input controls: show normally if no log today; if today exists, show when editing or adding -->
    <div v-if="!hasLogForToday || isEditing || isAdding" class="log-value">
      <!-- Boolean type: YES/NO buttons -->
      <div v-if="logType.type === LOG_TYPES.boolean" class="log-type-boolean">
        <button @click="clickYes">YES</button>
        <button @click="clickNo">NO</button>
      </div>

      <!-- Number type: Input and quick buttons -->
      <div
        v-else-if="logType.type === LOG_TYPES.number"
        class="log-type-number"
      >
        <div class="number-input-section">
          <input
            v-model.number="numberInput"
            type="number"
            placeholder="Enter a number..."
            class="number-input"
            @keyup.enter="submitNumber"
          />
          <button @click="submitNumber" class="submit-btn">Submit</button>
        </div>

        <div class="number-buttons">
          <button
            v-for="value in computedNumberButtons"
            :key="value"
            @click="clickNumberButton(value)"
            class="number-btn"
          >
            {{ value }}
          </button>
        </div>
      </div>
    </div>

    <!-- Conditional comment textarea -->
    <div
      v-if="showCommentInput && (!hasLogForToday || isEditing || isAdding)"
      class="comment-input"
    >
      <textarea
        v-model="commentText"
        placeholder="Add a comment for this log entry..."
        rows="3"
        class="comment-textarea"
      ></textarea>
    </div>

    <!-- Comment toggle button at bottom -->
    <div v-if="!hasLogForToday || isEditing || isAdding" class="comment-toggle">
      <button @click="toggleComment" class="toggle-comment-btn">
        {{ showCommentInput ? "❌" : "💬" }}
      </button>
    </div>
  </div>
</template>

<style scoped>
h4 {
  text-align: center;
  margin-bottom: 20px;
}

.log-type-boolean {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.log-type-boolean button {
  padding: 10px 20px;
  border: 1px solid #007bff;
  background-color: white;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.log-type-boolean button:hover {
  background-color: #007bff;
  color: white;
}

.comment-toggle {
  margin-top: auto;
  display: flex;
  justify-content: center;
  padding-bottom: 10px;
}

.toggle-comment-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #28a745;
  background-color: white;
  color: #28a745;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
}

.toggle-comment-btn:hover {
  background-color: #28a745;
  color: white;
  transform: scale(1.1);
}

.comment-input {
  margin-top: 15px;
  width: 100%;
}

.comment-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  font-size: 0.9em;
}

.comment-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

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

.number-buttons {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  width: 100%;
  max-width: 400px;
}

.number-btn {
  padding: 12px 8px;
  border: 1px solid #28a745;
  background-color: white;
  color: #28a745;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1em;
  font-weight: bold;
  text-align: center;
}

.number-btn:hover {
  background-color: #28a745;
  color: white;
  transform: translateY(-1px);
}

.number-btn:active {
  transform: translateY(0);
}

/* Today log exists message styling */
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

/* Responsive adjustments for smaller screens */
@media (max-width: 480px) {
  .number-buttons {
    grid-template-columns: repeat(4, 1fr);
  }

  .number-input-section {
    flex-direction: column;
    gap: 8px;
  }

  .number-input {
    width: 100%;
  }

  .message-content {
    padding: 20px;
    max-width: 300px;
  }

  .message-content p {
    font-size: 1.1em;
  }
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
</style>
