<script setup lang="ts">
interface Props {
  value: any;
}

const { value } = defineProps<Props>();
</script>

<template>
  <span class="value">
    {{ typeof value === "boolean" ? (value ? "✅" : "❌") : value }}
  </span>
</template>

<style scoped>
.value {
  background-color: #f3e5f5;
  color: #7b1fa2;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}
</style>
