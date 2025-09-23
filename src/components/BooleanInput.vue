<script setup lang="ts">
interface Props {
  isEditing: boolean;
  isAdding: boolean;
  selectedDate?: Date;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  submit: [value: boolean];
  update: [date: Date | null, value: boolean];
}>();

const clickYes = () => {
  const value = true;
  if (props.isEditing) {
    emit("update", props.selectedDate || null, value);
  } else {
    emit("submit", value);
  }
};

const clickNo = () => {
  const value = false;
  if (props.isEditing) {
    emit("update", props.selectedDate || null, value);
  } else {
    emit("submit", value);
  }
};
</script>

<template>
  <div class="log-type-boolean">
    <button @click="clickYes">YES</button>
    <button @click="clickNo">NO</button>
  </div>
</template>

<style scoped>
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
</style>
