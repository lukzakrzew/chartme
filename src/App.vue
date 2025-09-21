<script setup lang="ts">
import { ref, onMounted } from "vue";
import { exportData, importData } from "@/helpers/importExport";
import { useNotifications } from "@/composables/useNotifications";
import SettingsDialog from "@/components/SettingsDialog.vue";

const showSettingsDialog = ref(false);

// Initialize notifications when the app is mounted
onMounted(async () => {
  const { initialize } = useNotifications();
  await initialize();
});
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          <router-link to="/" class="title-link">ChartMe</router-link>
        </q-toolbar-title>
        <q-btn flat round dense icon="category" :to="{ path: '/categories' }" />
        <q-btn flat round dense icon="settings">
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item
                clickable
                @click="showSettingsDialog = true"
                v-close-popup
              >
                <q-item-section>Notifications</q-item-section>
              </q-item>
              <q-separator />
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

  <!-- Settings Dialog -->
  <SettingsDialog v-model="showSettingsDialog" />
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
