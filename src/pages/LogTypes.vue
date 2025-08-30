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

const navigateToFillInAll = () => {
  router.push("/fill-in-all");
};
</script>

<template>
  <div class="page-container">
    <!-- Fill in all button -->
    <div class="fill-in-all-container">
      <button @click="navigateToFillInAll" class="fill-in-all-btn">
        <span class="icon">✨</span>
        <span class="text">Fill in all</span>
      </button>
    </div>

    <!-- Log types list -->
    <div class="log-type-list">
      <div
        v-for="logType in logTypes"
        class="log-type"
        @click="navigateToAddLog(logType.name)"
      >
        {{ logType.name }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.fill-in-all-container {
  display: flex;
  justify-content: center;
  padding: 0 20px;
}

.fill-in-all-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  min-width: 200px;
  justify-content: center;
}

.fill-in-all-btn:hover {
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.fill-in-all-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.4);
}

.fill-in-all-btn .icon {
  font-size: 1.3em;
  transition: transform 0.3s ease;
}

.fill-in-all-btn:hover .icon {
  animation: sparkle 0.6s ease-in-out;
}

.fill-in-all-btn .text {
  letter-spacing: 0.5px;
}

@keyframes sparkle {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.1) rotate(180deg);
    opacity: 0.8;
  }
}

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

/* Responsive design */
@media (max-width: 480px) {
  .fill-in-all-btn {
    min-width: 180px;
    padding: 14px 28px;
    font-size: 1em;
  }

  .fill-in-all-container {
    padding: 0 10px;
  }
}
</style>
