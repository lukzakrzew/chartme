<script setup lang="ts">
import { LOG_TYPES } from "@/constants";

interface Props {
  selectedDate?: Date;
  logTypeName: string;
  isNumberType: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  edit: [];
  add: [];
}>();

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
