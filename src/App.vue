<script setup lang="ts">
import store from "store2";
import { LocalStorageKeys } from "@/stores/Logs";

function exportData() {
  // Get all data from localStorage except settings
  const exportData: Record<string, any> = {};

  // Get log types
  const logTypes = store.get(LocalStorageKeys.logTypes);
  if (logTypes) {
    exportData.logTypes = logTypes;
  }

  // Get categories
  const categories = store.get(LocalStorageKeys.categories);
  if (categories) {
    exportData.categories = categories;
  }

  // Get all log data (keys starting with logs-)
  const allKeys = store.keys();
  allKeys.forEach((key) => {
    if (key.startsWith(LocalStorageKeys.logsPrefix)) {
      const logData = store.get(key);
      if (logData) {
        exportData[key] = logData;
      }
    }
  });

  // Create and download JSON file
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });

  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `chartme-export-${
    new Date().toISOString().split("T")[0]
  }.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function importData() {
  // Create file input element
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json";
  fileInput.style.display = "none";

  fileInput.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);

        // Validate and import the data
        if (importedData.logTypes) {
          store.set(LocalStorageKeys.logTypes, importedData.logTypes);
        }

        if (importedData.categories) {
          store.set(LocalStorageKeys.categories, importedData.categories);
        }

        // Import all log data (keys starting with logs-)
        Object.keys(importedData).forEach((key) => {
          if (key.startsWith(LocalStorageKeys.logsPrefix)) {
            store.set(key, importedData[key]);
          }
        });

        // Reload the page to ensure all components pick up the new data
        window.location.reload();
      } catch (error) {
        console.error("Error importing data:", error);
        alert("Error importing data. Please check the file format.");
      }
    };

    reader.readAsText(file);

    // Clean up
    document.body.removeChild(fileInput);
  };

  // Trigger file selection
  document.body.appendChild(fileInput);
  fileInput.click();
}
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          <router-link to="/" class="title-link">ChartMe</router-link>
        </q-toolbar-title>
        <q-btn
          flat
          round
          dense
          icon="category"
          :to="{ path: '/add-category' }"
        />
        <q-btn flat round dense icon="settings">
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item clickable @click="importData" v-close-popup>
                <q-item-section>Import</q-item-section>
              </q-item>
              <q-item clickable @click="exportData" v-close-popup>
                <q-item-section>Export</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.q-page-container {
  width: 100%;
}

.title-link {
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.title-link:hover {
  opacity: 0.8;
}
</style>
