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
};

const clickYes = () => {
  const logValue = createLogValue(true);
  emit("submit", logValue);
  clearAfterSubmit();
};

const clickNo = () => {
  const logValue = createLogValue(false);
  emit("submit", logValue);
  clearAfterSubmit();
};

// Number input handlers
const submitNumber = () => {
  if (numberInput.value !== null && numberInput.value !== undefined) {
    const logValue = createLogValue(numberInput.value);
    emit("submit", logValue);
    numberInput.value = null; // Clear input
    clearAfterSubmit();
  }
};

const clickNumberButton = (value: number) => {
  const logValue = createLogValue(value);
  emit("submit", logValue);
  clearAfterSubmit();
};
</script>

<template>
  <div>
    <h4>{{ logType.name }}</h4>

    <!-- Show message when log for today already exists -->
    <div v-if="hasLogForToday" class="today-log-exists-message">
      <div class="message-content">
        <span class="check-icon">✅</span>
        <p>You've already logged a value for today!</p>
        <p class="sub-message">Check your log history below.</p>
      </div>
    </div>

    <!-- Show input controls only when no log for today exists -->
    <div v-else class="log-value">
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
    <div v-if="showCommentInput && !hasLogForToday" class="comment-input">
      <textarea
        v-model="commentText"
        placeholder="Add a comment for this log entry..."
        rows="3"
        class="comment-textarea"
      ></textarea>
    </div>

    <!-- Comment toggle button at bottom - only show when no log for today -->
    <div v-if="!hasLogForToday" class="comment-toggle">
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
  border: 2px solid #28a745;
  border-radius: 12px;
  padding: 30px;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.check-icon {
  font-size: 3em;
  display: block;
  margin-bottom: 15px;
}

.message-content p {
  margin: 0;
  font-size: 1.2em;
  color: #28a745;
  font-weight: 600;
}

.sub-message {
  font-size: 1em !important;
  color: #6c757d !important;
  font-weight: 400 !important;
  margin-top: 10px !important;
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

  .check-icon {
    font-size: 2.5em;
  }

  .message-content p {
    font-size: 1.1em;
  }
}
</style>
