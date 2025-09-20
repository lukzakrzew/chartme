<script setup lang="ts">
import { ref } from "vue";

interface Props {
  showCommentInput: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  toggle: [];
  "update:commentText": [value: string];
}>();

const commentText = ref("");

const toggleComment = () => {
  emit("toggle");
  if (props.showCommentInput) {
    commentText.value = ""; // Clear content when closing
    emit("update:commentText", "");
  }
};

const updateComment = (value: string) => {
  commentText.value = value;
  emit("update:commentText", value);
};
</script>

<template>
  <div>
    <!-- Comment input row with textarea and button -->
    <div v-if="showCommentInput" class="comment-input-row">
      <textarea
        :value="commentText"
        placeholder="Add a comment for this log entry..."
        rows="3"
        class="comment-textarea"
        @input="updateComment(($event.target as HTMLTextAreaElement).value)"
      ></textarea>
      <q-btn
        icon="cancel"
        round
        flat
        size="md"
        color="blue"
        aria-label="Hide comment"
        @click="toggleComment"
        class="comment-cancel-btn"
      />
    </div>

    <!-- Comment toggle button when input is hidden -->
    <div v-else class="comment-toggle">
      <q-btn
        icon="chat"
        round
        flat
        size="md"
        color="blue"
        aria-label="Add comment"
        @click="toggleComment"
      />
    </div>
  </div>
</template>

<style scoped>
.comment-toggle {
  margin-top: auto;
  display: flex;
  justify-content: center;
  padding-bottom: 10px;
}

.comment-input-row {
  margin-top: 15px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
}

.comment-textarea {
  flex: 1;
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

.comment-cancel-btn {
  flex-shrink: 0;
  margin-top: 2px;
}
</style>
