<script setup lang="ts">
import { useRouter } from "vue-router";
import { useLogsStore } from "@/stores/Logs";
import CategoryList from "@/components/CategoryList.vue";
import type { Category } from "@/types";

const logsStore = useLogsStore();
const router = useRouter();

function onEditCategory(category: Category) {
  // Navigate to edit category route with the category data
  router.push(`/edit-category/${encodeURIComponent(category.name)}`);
}

function navigateToAddCategory() {
  router.push("/add-category");
}
</script>

<template>
  <q-page class="q-pa-md">
    <div class="page-header">
      <h4>Categories</h4>
    </div>

    <CategoryList
      :categories="logsStore.categories"
      @editCategory="onEditCategory"
    />

    <!-- Floating Action Button -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" @click="navigateToAddCategory" />
    </q-page-sticky>
  </q-page>
</template>

<style scoped>
.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.page-header h4 {
  margin: 0;
  color: #333;
}
</style>
