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
    <!-- Conditional comment textarea -->
    <div v-if="showCommentInput" class="comment-input">
      <textarea
        :value="commentText"
        placeholder="Add a comment for this log entry..."
        rows="3"
        class="comment-textarea"
        @input="updateComment(($event.target as HTMLTextAreaElement).value)"
      ></textarea>
    </div>

    <!-- Comment toggle button at bottom -->
    <div class="comment-toggle">
      <button @click="toggleComment" class="toggle-comment-btn">
        {{ showCommentInput ? "❌" : "💬" }}
      </button>
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
</style>
