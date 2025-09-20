<template>
  <div class="notification-settings q-pa-md">
    <div class="text-h6 q-mb-md">Daily Reminders</div>

    <div class="q-mb-md">
      <q-toggle
        v-model="notificationsEnabled"
        label="Enable daily reminders"
        color="primary"
        @update:model-value="handleToggleNotifications"
      />
    </div>

    <div v-if="notificationsEnabled" class="q-mb-md">
      <q-input
        v-model="notificationTime"
        label="Reminder time"
        type="time"
        filled
        :rules="[(val) => !!val || 'Please select a time']"
        @update:model-value="handleTimeChange"
      >
        <template v-slot:prepend>
          <q-icon name="schedule" />
        </template>
      </q-input>
    </div>

    <div v-if="notificationsEnabled" class="q-mb-md">
      <q-btn
        color="primary"
        label="Test Notification"
        outline
        @click="testNotification"
        :loading="testingNotification"
        :disable="!hasPermission"
      >
        <template v-slot:loading>
          <q-spinner-hourglass class="on-left" />
          Testing...
        </template>
      </q-btn>
    </div>

    <div v-if="!isSupported" class="text-negative q-mb-md">
      <q-icon name="warning" class="q-mr-sm" />
      Notifications are not supported in this browser.
    </div>

    <div
      v-else-if="!hasPermission && notificationsEnabled"
      class="text-orange q-mb-md"
    >
      <q-icon name="info" class="q-mr-sm" />
      Notification permission required. Click "Test Notification" to grant
      permission.
    </div>

    <div
      v-else-if="hasPermission && notificationsEnabled"
      class="text-positive"
    >
      <q-icon name="check_circle" class="q-mr-sm" />
      Notifications are enabled and scheduled for {{ notificationTime }} daily.
      <br /><small class="text-grey-7"
        >Works when browser is running (even in background)</small
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useSettingsStore } from "@/stores/Settings";
import { useNotifications } from "@/composables/useNotifications";

const settingsStore = useSettingsStore();
const {
  isSupported,
  hasPermission,
  requestPermission,
  updateSettings,
  testNotification: sendTestNotification,
  initialize,
} = useNotifications();

// Reactive state bound to settings store
const notificationsEnabled = computed({
  get: () => settingsStore.settings.notifications.enabled,
  set: (value: boolean) => settingsStore.setNotificationsEnabled(value),
});

const notificationTime = computed({
  get: () => settingsStore.settings.notifications.time,
  set: (value: string) => settingsStore.setNotificationTime(value),
});

const testingNotification = ref(false);

// Methods
const handleToggleNotifications = async (enabled: boolean) => {
  if (enabled && !hasPermission.value) {
    // Request permission if enabling notifications
    await requestPermission();
  }

  // Update notification scheduling
  await updateSettings({
    enabled,
    time: notificationTime.value,
  });
};

const handleTimeChange = async (time: string | number | null) => {
  if (time === null || time === "") return;

  const timeString = typeof time === "string" ? time : time.toString();

  // Update notification scheduling if enabled
  if (notificationsEnabled.value) {
    await updateSettings({
      enabled: true,
      time: timeString,
    });
  }
};

const testNotification = async () => {
  testingNotification.value = true;
  try {
    await sendTestNotification();
  } finally {
    testingNotification.value = false;
  }
};

// Initialize on mount
onMounted(async () => {
  await initialize();
});
</script>

<style scoped>
.notification-settings {
  min-width: 300px;
}
</style>
