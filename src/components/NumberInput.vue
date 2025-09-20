<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import type { LogValue } from "@/types";

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
  updateToday: [value: number];
  updateDate: [date: Date, value: number];
  incrementToday: [delta: number, comment: string];
  incrementDate: [date: Date, delta: number, comment: string];
}>();

// Number input functionality
const numberInput = ref<number | null>(null);
const numberInputRef = ref<HTMLInputElement | null>(null);

// Reactive computed for number buttons based on oneToTen setting and last logged value
const computedNumberButtons = computed((): number[] => {
  // If oneToTen is true, always show buttons from 1 to 10
  if (props.oneToTen) {
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

const submitNumber = () => {
  if (numberInput.value !== null && numberInput.value !== undefined) {
    if (props.isAdding) {
      if (props.selectedDate) {
        emit(
          "incrementDate",
          props.selectedDate,
          Number(numberInput.value),
          props.commentText
        );
      } else {
        emit("incrementToday", Number(numberInput.value), props.commentText);
      }
    } else {
      const value = Number(numberInput.value);
      if (props.isEditing) {
        if (props.selectedDate) {
          emit("updateDate", props.selectedDate, value);
        } else {
          emit("updateToday", value);
        }
      } else {
        emit("submit", value);
      }
    }
    numberInput.value = null; // Clear input
  }
};

const clickNumberButton = (value: number) => {
  if (props.isAdding) {
    if (props.selectedDate) {
      emit("incrementDate", props.selectedDate, value, props.commentText);
    } else {
      emit("incrementToday", value, props.commentText);
    }
  } else {
    if (props.isEditing) {
      if (props.selectedDate) {
        emit("updateDate", props.selectedDate, value);
      } else {
        emit("updateToday", value);
      }
    } else {
      emit("submit", value);
    }
  }
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
    <div class="number-input-section">
      <input
        ref="numberInputRef"
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
}
</style>
