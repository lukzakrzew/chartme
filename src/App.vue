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
    <q-header elevated class="app-header">
      <q-toolbar>
        <q-toolbar-title class="app-brand">
          <router-link to="/" class="title-link">
            <q-avatar size="28px" class="brand-avatar">
              <q-icon name="auto_graph" />
            </q-avatar>
            <span class="brand-name">ChartMe</span>
          </router-link>
        </q-toolbar-title>

        <q-space />

        <q-btn
          flat
          round
          dense
          icon="category"
          :to="{ path: '/categories' }"
          class="icon-btn"
        >
          <q-tooltip anchor="bottom middle" self="top middle"
            >Categories</q-tooltip
          >
        </q-btn>
        <q-btn flat round dense icon="settings" class="icon-btn">
          <q-tooltip anchor="bottom middle" self="top middle">Menu</q-tooltip>
          <q-menu>
            <q-list style="min-width: 140px">
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
.app-header {
  background: linear-gradient(90deg, #2d2a6e, #6a11cb 60%, #2575fc);
}

.app-brand {
  display: flex;
  align-items: center;
}

.q-page-container {
  width: 100%;
}

.title-link {
  color: #fff;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.title-link:hover {
  opacity: 0.8;
}

.brand-avatar {
  background: rgba(255, 255, 255, 0.18);
  margin-right: 8px;
}

.brand-name {
  font-weight: 800;
  letter-spacing: 0.3px;
}

.icon-btn :deep(.q-icon) {
  color: #fff;
}
</style>
