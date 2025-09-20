import { ref, computed } from "vue";
import { Notify } from "quasar";
import { useSettingsStore } from "@/stores/Settings";

export type NotificationPermission = "default" | "granted" | "denied";

export interface NotificationSettings {
  enabled: boolean;
  time: string; // Format: "HH:MM"
}

const permissionStatus = ref<NotificationPermission>("default");

export function useNotifications() {
  const settingsStore = useSettingsStore();

  // Check if notifications are supported
  const isSupported = computed(() => {
    return "Notification" in window && "serviceWorker" in navigator;
  });

  // Get current permission status
  const updatePermissionStatus = async () => {
    if (!isSupported.value) return;

    permissionStatus.value = Notification.permission as NotificationPermission;
  };

  // Request notification permission
  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported.value) {
      Notify.create({
        type: "negative",
        message: "Notifications are not supported in this browser",
        position: "top",
      });
      return "denied";
    }

    try {
      const permission = await Notification.requestPermission();
      permissionStatus.value = permission;

      if (permission === "granted") {
        Notify.create({
          type: "positive",
          message: "Notification permission granted!",
          position: "top",
        });
      } else {
        Notify.create({
          type: "negative",
          message: "Notification permission denied",
          position: "top",
        });
      }

      return permission;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      Notify.create({
        type: "negative",
        message: "Failed to request notification permission",
        position: "top",
      });
      return "denied";
    }
  };

  // Schedule notifications
  const scheduleNotifications = async () => {
    if (!isSupported.value) return false;

    // Ensure we have permission
    if (permissionStatus.value !== "granted") {
      const permission = await requestPermission();
      if (permission !== "granted") return false;
    }

    try {
      const notificationTime =
        settingsStore.settings.notifications?.time || "21:30";
      const [hours, minutes] = notificationTime.split(":").map(Number);
      const now = new Date();
      const scheduledTime = new Date(now);
      scheduledTime.setHours(hours, minutes, 0, 0);

      // If the time has already passed today, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const delay = scheduledTime.getTime() - now.getTime();

      console.log(
        `Scheduling notification for ${scheduledTime.toISOString()} (in ${Math.round(
          delay / 1000 / 60
        )} minutes)`
      );

      // Store the scheduled time in localStorage for persistence
      localStorage.setItem("chartme-notification-time", notificationTime);
      localStorage.setItem(
        "chartme-notification-scheduled",
        scheduledTime.toISOString()
      );

      // Update last scheduled time in store
      settingsStore.updateNotificationSettings({
        ...(settingsStore.settings.notifications || {}),
        lastScheduled: new Date(),
      });

      // Schedule the notification using setTimeout
      // Note: This only works while the page is open
      setTimeout(() => {
        showLocalNotification();
      }, delay);

      Notify.create({
        type: "positive",
        message: `Daily reminder scheduled for ${notificationTime}`,
        position: "top",
      });

      return true;
    } catch (error) {
      console.error("Error scheduling notifications:", error);
      Notify.create({
        type: "negative",
        message: "Failed to schedule notifications",
        position: "top",
      });
      return false;
    }
  };

  // Show a local notification
  const showLocalNotification = async () => {
    if (!isSupported.value || permissionStatus.value !== "granted") return;

    try {
      const notification = new Notification("ChartMe Daily Reminder", {
        body: "Don't forget to track your progress.",
        icon: "/vite.svg",
        tag: "chartme-daily-reminder",
        requireInteraction: false,
        silent: false,
      });

      // Auto-close after 10 seconds
      setTimeout(() => notification.close(), 10000);

      // Reschedule for tomorrow
      if (settingsStore.settings.notifications?.enabled) {
        setTimeout(() => scheduleNotifications(), 1000); // Small delay to avoid immediate rescheduling
      }
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  };

  // Cancel scheduled notifications
  const cancelNotifications = async () => {
    if (!isSupported.value) return;

    try {
      // Clear stored schedule
      localStorage.removeItem("chartme-notification-time");
      localStorage.removeItem("chartme-notification-scheduled");

      // Clear last scheduled time in store
      settingsStore.updateNotificationSettings({
        ...(settingsStore.settings.notifications || {}),
        lastScheduled: undefined,
      });

      Notify.create({
        type: "info",
        message: "Daily reminders cancelled",
        position: "top",
      });
    } catch (error) {
      console.error("Error cancelling notifications:", error);
    }
  };

  // Update notification settings
  const updateSettings = async (settings: Partial<NotificationSettings>) => {
    const oldEnabled = settingsStore.settings.notifications?.enabled || false;
    const oldTime = settingsStore.settings.notifications?.time || "19:00";

    settingsStore.updateNotificationSettings(settings);

    // If settings changed, update scheduling
    const enabledChanged =
      oldEnabled !== (settingsStore.settings.notifications?.enabled || false);
    const timeChanged =
      oldTime !== (settingsStore.settings.notifications?.time || "19:00");

    if (enabledChanged || timeChanged) {
      if (settingsStore.settings.notifications?.enabled) {
        await scheduleNotifications();
      } else {
        await cancelNotifications();
      }
    }
  };

  // Initialize - check permission status and restore schedules
  const initialize = async () => {
    await updatePermissionStatus();

    // Check if there are stored schedules to restore
    const storedTime = localStorage.getItem("chartme-notification-time");
    const storedScheduled = localStorage.getItem(
      "chartme-notification-scheduled"
    );

    if (storedTime && storedScheduled) {
      const scheduledTime = new Date(storedScheduled);
      const now = new Date();

      // If the scheduled time has passed, reschedule for next occurrence
      if (scheduledTime <= now) {
        console.log("Stored notification time has passed, rescheduling...");
        if (
          settingsStore.settings.notifications.enabled &&
          permissionStatus.value === "granted"
        ) {
          await scheduleNotifications();
        }
      } else {
        // Restore the existing schedule
        const delay = scheduledTime.getTime() - now.getTime();
        console.log(
          `Restoring notification schedule (${Math.round(
            delay / 1000 / 60
          )} minutes remaining)`
        );

        setTimeout(() => {
          showLocalNotification();
        }, delay);
      }
    } else if (
      settingsStore.settings.notifications?.enabled &&
      permissionStatus.value === "granted"
    ) {
      // No stored schedule but notifications are enabled, schedule them
      await scheduleNotifications();
    }
  };

  // Test notification (for debugging)
  const testNotification = async () => {
    if (!isSupported.value) return;

    if (permissionStatus.value !== "granted") {
      await requestPermission();
      return;
    }

    try {
      const notification = new Notification("ChartMe Test", {
        body: "This is a test notification to verify your settings work!",
        icon: "/vite.svg",
        tag: "chartme-test",
      });

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      Notify.create({
        type: "positive",
        message: "Test notification sent!",
        position: "top",
      });
    } catch (error) {
      console.error("Error showing test notification:", error);
      Notify.create({
        type: "negative",
        message: "Failed to show test notification",
        position: "top",
      });
    }
  };

  return {
    // Reactive state
    notificationSettings: computed(
      () =>
        settingsStore.settings.notifications || {
          enabled: false,
          time: "19:00",
        }
    ),
    permissionStatus,
    isSupported,

    // Computed
    isEnabled: computed(
      () => settingsStore.settings.notifications?.enabled || false
    ),
    hasPermission: computed(() => permissionStatus.value === "granted"),

    // Methods
    requestPermission,
    updatePermissionStatus,
    scheduleNotifications,
    cancelNotifications,
    updateSettings,
    initialize,
    testNotification,
  };
}
