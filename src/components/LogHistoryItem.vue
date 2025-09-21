<script setup lang="ts">
import { ref } from "vue";
import type { LogValue } from "@/types";
import ValueDisplay from "./ValueDisplay.vue";

interface Props {
  entry: {
    date: Date;
    logValue?: LogValue;
  };
}

defineProps<Props>();

const emit = defineEmits<{
  dateClick: [date: Date];
}>();

// Track which comments are expanded in this item
const expandedComments = ref(new Set<string>());

const toggleCommentVisibility = (timestamp: string) => {
  if (expandedComments.value.has(timestamp)) {
    expandedComments.value.delete(timestamp);
  } else {
    expandedComments.value.add(timestamp);
  }
};

const handleDateClick = (date: Date) => {
  emit("dateClick", date);
};
</script>

<template>
  <div class="log-entry" :class="{ 'empty-date': !entry.logValue }">
    <div class="log-value-display">
      <div v-if="entry.logValue" class="log-content">
        <span
          class="timestamp clickable date-first"
          @click="handleDateClick(new Date(entry.logValue.timestamp))"
          >{{ new Date(entry.logValue.timestamp).toLocaleDateString() }}</span
        >
        <ValueDisplay :value="entry.logValue.value" />
        <span
          class="comment-icon"
          :class="{ visible: entry.logValue.comment }"
          @click="
            entry.logValue.comment
              ? toggleCommentVisibility(entry.logValue.timestamp)
              : null
          "
        >
          💬
        </span>
      </div>
      <div v-else class="empty-date-content">
        <span
          class="timestamp clickable empty-date-timestamp date-first"
          @click="handleDateClick(entry.date)"
          >{{ entry.date.toLocaleDateString() }}</span
        >
        <span class="no-entry">No entry</span>
      </div>
    </div>
    <div
      v-if="
        entry.logValue &&
        entry.logValue.comment &&
        expandedComments.has(entry.logValue.timestamp)
      "
      class="comment"
    >
      {{ entry.logValue.comment }}
    </div>
  </div>
</template>

<style scoped>
.log-entry {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px 20px;
  margin-bottom: 8px;
  background-color: #fafafa;
}

.log-entry.empty-date {
  background-color: #f8f9fa;
  border-color: #e9ecef;
  opacity: 0.7;
}

.log-value-display {
  display: flex;
  align-items: center;
}

.log-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.empty-date-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.no-entry {
  font-style: italic;
  color: #888;
  font-size: 0.9em;
}

.date-first {
  min-width: 100px;
}

.timestamp {
  font-size: 0.9em;
  color: #666;
}

.timestamp.clickable {
  cursor: pointer;
  transition: color 0.2s ease;
}

.timestamp.clickable:hover {
  color: #007bff;
  text-decoration: underline;
}

.empty-date-timestamp {
  font-weight: normal;
  color: #888 !important;
}

.empty-date-timestamp:hover {
  color: #007bff !important;
  text-decoration: underline;
}

.comment-icon {
  font-size: 1em;
  opacity: 0;
  pointer-events: none;
  transition: all 0.2s;
}

.comment-icon.visible {
  opacity: 0.7;
  pointer-events: auto;
  cursor: pointer;
}

.comment-icon.visible:hover {
  opacity: 1;
  transform: scale(1.2);
}

.comment {
  font-style: italic;
  color: #555;
  margin-top: 5px;
}
</style>
