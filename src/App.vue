<script setup lang="ts"></script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          <router-link to="/" class="title-link">ChartMe</router-link>
        </q-toolbar-title>
        <q-btn flat round dense icon="add" :to="{ path: '/add-log-type' }" />
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
