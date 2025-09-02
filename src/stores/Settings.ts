import store from "store2";
import { defineStore } from "pinia";
import { ref } from "vue";

export const LocalStorageKeys = {
  settings: "settings",
} as const;

export interface AppSettings {
  groupByCategories: boolean;
  showArchived: boolean;
}

export const useSettingsStore = defineStore("settings", () => {
  // Initialize settings from localStorage or defaults
  const defaultSettings: AppSettings = {
    groupByCategories: false,
    showArchived: false,
  };

  const settings = ref<AppSettings>(
    store.get(LocalStorageKeys.settings) || defaultSettings
  );

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
  };
});
