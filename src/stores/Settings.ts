import store from "store2";
import { defineStore } from "pinia";
import { ref } from "vue";

export const LocalStorageKeys = {
  settings: "settings",
} as const;

export interface AppSettings {
  groupByCategories: boolean;
  showArchived: boolean;
  notifications: {
    enabled: boolean;
    time: string; // Format: "HH:MM"
    lastScheduled?: Date;
  };
}

export const useSettingsStore = defineStore("settings", () => {
  // Initialize settings from localStorage or defaults
  const defaultSettings: AppSettings = {
    groupByCategories: false,
    showArchived: false,
    notifications: {
      enabled: false,
      time: "21:30",
    },
  };

  // Load settings from localStorage and merge with defaults
  const storedSettings = store.get(LocalStorageKeys.settings);
  const settings = ref<AppSettings>({
    ...defaultSettings,
    ...storedSettings,
    notifications: {
      ...defaultSettings.notifications,
      ...(storedSettings?.notifications || {}),
    },
  });

  function updateSettings(newSettings: Partial<AppSettings>) {
    settings.value = { ...settings.value, ...newSettings };
    store.set(LocalStorageKeys.settings, settings.value);
  }

  function setGroupByCategories(value: boolean) {
    updateSettings({ groupByCategories: value });
  }

  function toggleGroupByCategories() {
    setGroupByCategories(!settings.value.groupByCategories);
  }

  function setShowArchived(value: boolean) {
    updateSettings({ showArchived: value });
  }

  function toggleShowArchived() {
    setShowArchived(!settings.value.showArchived);
  }

  // Notification settings
  function setNotificationsEnabled(enabled: boolean) {
    updateSettings({
      notifications: {
        ...settings.value.notifications,
        enabled,
      },
    });
  }

  function setNotificationTime(time: string) {
    updateSettings({
      notifications: {
        ...settings.value.notifications,
        time,
      },
    });
  }

  function updateNotificationSettings(
    notificationSettings: Partial<AppSettings["notifications"]>
  ) {
    updateSettings({
      notifications: {
        ...settings.value.notifications,
        ...notificationSettings,
      },
    });
  }

  // Initialize localStorage with defaults if not exists
  if (!store.get(LocalStorageKeys.settings)) {
    store.set(LocalStorageKeys.settings, defaultSettings);
  }

  return {
    settings,
    updateSettings,
    setGroupByCategories,
    toggleGroupByCategories,
    setShowArchived,
    toggleShowArchived,
    setNotificationsEnabled,
    setNotificationTime,
    updateNotificationSettings,
  };
});
