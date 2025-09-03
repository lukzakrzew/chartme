<script setup lang="ts">
import { useRouter } from "vue-router";
import { useUnfilledLogTypes } from "@/composables/useUnfilledLogTypes";

interface CategoryGroup {
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  items: any[];
}

interface Props {
  group: CategoryGroup;
}

const props = defineProps<Props>();
const router = useRouter();

// Use composable for unfilled log types logic
const { unfilledLogTypes } = useUnfilledLogTypes(props.group.categoryName);

// Navigate to fill-in-all page with category filter
const navigateToFillCategory = () => {
  router.push({
    path: "/fill-in-all",
    query: { categoryName: props.group.categoryName },
  });
};
</script>

<template>
  <div class="category-header">
    <q-icon
      :name="group.categoryIcon"
      :color="group.categoryColor"
      size="md"
      class="category-header-icon"
    />
    <span class="category-name">{{ group.categoryName }}</span>

    <!-- Fill Category Button -->
    <button
      v-if="unfilledLogTypes.length > 0"
      @click="navigateToFillCategory"
      class="fill-category-btn"
      :title="`Fill ${unfilledLogTypes.length} unfilled log${
        unfilledLogTypes.length === 1 ? '' : 's'
      } for today`"
    >
      📝 Fill ({{ unfilledLogTypes.length }})
    </button>
  </div>
</template>

<style scoped>
.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  border: 1px solid #e1e5e9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.category-header-icon {
  font-size: 1.4em;
  opacity: 0.9;
}

.category-name {
  font-size: 1.1em;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.fill-category-btn {
  padding: 6px 12px;
  border: 1px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85em;
  font-weight: 500;
  white-space: nowrap;
}

.fill-category-btn:hover {
  background: #007bff;
  color: white;
  transform: translateY(-1px);
}

/* Responsive design */
@media (max-width: 480px) {
  .category-header {
    padding: 10px 12px;
  }

  .category-name {
    font-size: 1em;
  }

  .fill-category-btn {
    padding: 4px 8px;
    font-size: 0.8em;
  }
}
</style>
