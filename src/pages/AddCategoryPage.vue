<template>
  <q-page class="q-pa-md">
    <div class="page-header">
      <h4>{{ isEditMode ? "Edit Category" : "Add New Category" }}</h4>
    </div>

    <CategoryForm
      ref="categoryFormRef"
      @cancel="onCancel"
      @saved="onCategorySaved"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useLogsStore } from "@/stores/Logs";
import CategoryForm from "@/components/CategoryForm.vue";

interface Props {
  categoryName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  categoryName: undefined,
});

const logsStore = useLogsStore();
const router = useRouter();
const categoryFormRef = ref();

const isEditMode = ref(false);

onMounted(() => {
  if (props.categoryName) {
    // Edit mode
    isEditMode.value = true;
    const category = logsStore.getCategory(props.categoryName);
    if (category) {
      setTimeout(() => {
        categoryFormRef.value?.startEditCategory(category);
      }, 0);
    }
  }
});

function onCancel() {
  navigateToCategories();
}

function onCategorySaved() {
  // Category is already saved by the form component
  navigateToCategories();
}

function navigateToCategories() {
  router.push("/categories");
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.page-header h4 {
  margin: 0;
  color: #333;
}
</style>
