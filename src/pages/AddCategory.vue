<template>
  <q-page class="q-pa-md">
    <CategoryForm
      v-if="showForm"
      ref="categoryFormRef"
      @cancel="onCancel"
      @saved="onCategorySaved"
    />

    <CategoryList
      v-else
      :categories="logsStore.categories"
      @editCategory="onEditCategory"
    />

    <!-- Floating Action Button -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        fab
        icon="add"
        color="primary"
        @click="onAddCategory"
        :class="{ 'q-fab--hide': showForm }"
      />
    </q-page-sticky>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useLogsStore } from "@/stores/Logs";
import CategoryForm from "@/components/CategoryForm.vue";
import CategoryList from "@/components/CategoryList.vue";
import type { Category } from "@/types";

const logsStore = useLogsStore();
const categoryFormRef = ref();
const showForm = ref(false);

function onAddCategory() {
  showForm.value = true;
  // Reset form to ensure it's in add mode
  categoryFormRef.value?.resetForm();
}

function onCancel() {
  showForm.value = false;
}

function onCategorySaved(category: Category) {
  // Category is already saved by the form component
  showForm.value = false;
}

function onEditCategory(category: Category) {
  showForm.value = true;
  // Use nextTick to ensure the form is rendered before calling startEditCategory
  setTimeout(() => {
    categoryFormRef.value?.startEditCategory(category);
  }, 0);
}
</script>

<style scoped>
.q-fab--hide {
  opacity: 0;
  pointer-events: none;
  transform: scale(0.8);
  transition: all 0.3s ease;
}

.q-btn.fab {
  transition: all 0.3s ease;
}
</style>
