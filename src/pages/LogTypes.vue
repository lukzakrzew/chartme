<script setup lang="ts">
import { useLogsStore } from "@/stores/Logs";
import { computed } from "vue";
import { useRouter } from "vue-router";

const logsStore = useLogsStore();
const router = useRouter();
const logTypes = computed(() => logsStore.logTypes);

const navigateToAddLog = (logTypeName: string) => {
  router.push(`/log/${logTypeName}`);
};
</script>

<template>
  <div class="log-type-list">
    <div
      v-for="logType in logTypes"
      class="log-type"
      @click="navigateToAddLog(logType.name)"
    >
      {{ logType.name }}
    </div>
  </div>
</template>

<style scoped>
.log-type-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.log-type {
  border: 1px solid #eee;
  padding: 10px;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.2s;
}

.log-type:hover {
  background-color: #f5f5f5;
}
</style>
