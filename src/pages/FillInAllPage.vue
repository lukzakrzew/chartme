<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useLogsStore } from "@/stores/Logs";
import type { LogValue } from "@/types";
import FillInAllForm from "@/components/FillInAllForm.vue";
import LogTypePills from "@/components/LogTypePills.vue";
import { useUnfilledLogTypes } from "@/composables/useUnfilledLogTypes";

const logsStore = useLogsStore();
const router = useRouter();
const route = useRoute();
const currentIndex = ref(0);

// Get category name from query parameter
const categoryName = computed(
  () => route.query.categoryName as string | undefined
);

// Use composable for unfilled log types logic
const { unfilledLogTypes, isLogTypeFilledRecently } = useUnfilledLogTypes(
  categoryName.value
);

// Current log type being filled
const currentLogType = computed(() => {
  return unfilledLogTypes.value[currentIndex.value] || null;
});

// Progress information
const totalCount = computed(() => unfilledLogTypes.value.length);

const progressPercentage = computed(() => {
  if (totalCount.value === 0) return 100;
  return Math.round((currentIndex.value / totalCount.value) * 100);
});

// Handle log submission
const handleLogSubmit = (logValue: LogValue) => {
  if (currentLogType.value) {
    logsStore.addLogValue(currentLogType.value.name, logValue);
    nextLogType();
  }
};

// Navigation functions
const nextLogType = () => {
  if (currentIndex.value < unfilledLogTypes.value.length - 1) {
    currentIndex.value++;
  } else {
    // Loop back to the beginning instead of going home
    currentIndex.value = 0;
  }
};

const skipLogType = () => {
  nextLogType();
};

// Jump to a specific log type by name
const jumpToLogTypeByName = (logTypeName: string) => {
  const index = unfilledLogTypes.value.findIndex(
    (lt) => lt.name === logTypeName
  );
  if (index !== -1) {
    currentIndex.value = index;
  }
};

// Check if we're done (no unfilled log types)
const isCompleted = computed(() => {
  return totalCount.value === 0;
});
</script>

<template>
  <div>
    <!-- Progress bar -->
    <div v-if="!isCompleted" class="progress-bar-container">
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
    </div>

    <!-- Header with progress -->
    <div class="header">
      <div class="progress-info">
        <h3 v-if="categoryName">Fill {{ categoryName }} logs</h3>
        <h3 v-else>Fill in all logs</h3>
      </div>
    </div>

    <!-- Main content -->
    <div class="main-content">
      <!-- Completion message -->
      <div v-if="isCompleted" class="completion-message">
        <div class="completion-content">
          <span class="completion-icon">🎉</span>
          <h2>All done!</h2>
          <p v-if="totalCount === 0">
            <span v-if="categoryName"
              >All {{ categoryName }} log types are already filled for
              today.</span
            >
            <span v-else>All your log types are already filled for today.</span>
          </p>
          <p v-else>
            <span v-if="categoryName"
              >You've successfully filled in all {{ categoryName }} log types
              for today.</span
            >
            <span v-else
              >You've successfully filled in all your log types for today.</span
            >
          </p>
          <button @click="router.push('/')" class="done-btn">
            Go back to home
          </button>
        </div>
      </div>

      <!-- Current log form -->
      <div v-else-if="currentLogType">
        <FillInAllForm
          :current-log-type="currentLogType"
          @submit="handleLogSubmit"
          @skip="skipLogType"
        />

        <!-- Log types overview -->
        <LogTypePills
          :current-log-type="currentLogType"
          :is-log-type-filled-recently="isLogTypeFilledRecently"
          @jump-to="jumpToLogTypeByName"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.progress-info {
  text-align: center;
  flex: 1;
}

.progress-info h3 {
  margin: 0;
  color: #333;
  font-size: 1.3em;
}

.progress-text {
  margin-top: 4px;
  color: #666;
  font-size: 0.9em;
}

.remaining {
  color: #888;
}

.progress-bar-container {
  padding: 0;
  display: flex;
  align-items: center;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.main-content {
  flex: 1;
  overflow-y: auto;
}

.completion-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 300px;
}

.completion-content {
  text-align: center;
  background: #f8f9fa;
  border: 2px solid #28a745;
  border-radius: 16px;
  padding: 40px;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.completion-icon {
  font-size: 4em;
  display: block;
  margin-bottom: 20px;
}

.completion-content h2 {
  margin: 0 0 15px 0;
  color: #28a745;
  font-size: 1.8em;
}

.completion-content p {
  margin: 0 0 25px 0;
  color: #666;
  line-height: 1.5;
}

.done-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.done-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
}

/* Responsive design */
@media (max-width: 480px) {
  .header {
    padding: 15px;
  }

  .progress-info h3 {
    font-size: 1.1em;
  }

  .completion-content {
    padding: 30px 20px;
    margin: 0 10px;
  }
}
</style>
