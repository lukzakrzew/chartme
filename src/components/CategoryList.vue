<template>
  <q-card class="q-pa-lg q-mt-lg">
    <q-card-section>
      <div class="text-h6 q-mb-md">Existing Categories</div>

      <div v-if="categories.length === 0" class="no-categories">
        No categories created yet
      </div>

      <div
        v-else
        v-for="category in categories"
        :key="category.name"
        class="category-entry"
      >
        <div class="category-display">
          <div class="left-section">
            <q-icon
              :name="category.icon"
              size="md"
              :color="category.color"
              class="category-icon"
            />
            <span class="category-name">{{ category.name }}</span>
          </div>
          <div class="right-section">
            <q-icon
              name="edit"
              @click="$emit('editCategory', category)"
              class="edit-icon"
            />
            <q-icon
              name="description"
              :class="{ visible: category.description }"
              @click="
                category.description
                  ? toggleDescriptionVisibility(category.name)
                  : null
              "
              class="description-icon"
            />
          </div>
        </div>
        <div
          v-if="category.description && expandedDescriptions.has(category.name)"
          class="category-description"
        >
          {{ category.description }}
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, defineEmits } from "vue";
import type { Category } from "@/types";

defineProps<{
  categories: Category[];
}>();

defineEmits<{
  editCategory: [category: Category];
}>();

const expandedDescriptions = ref(new Set<string>());

function toggleDescriptionVisibility(categoryName: string) {
  if (expandedDescriptions.value.has(categoryName)) {
    expandedDescriptions.value.delete(categoryName);
  } else {
    expandedDescriptions.value.add(categoryName);
  }
}
</script>

<style scoped>
.q-card {
  max-width: 600px;
  margin: 0 auto;
}

/* Category List Styles */
.no-categories {
  color: #888;
  font-style: italic;
  text-align: center;
  padding: 20px;
}

.category-entry {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  background-color: #fafafa;
  transition: all 0.2s ease;
}

.category-entry:hover {
  border-color: #d0d0d0;
  background-color: #f0f0f0;
}

.category-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-icon {
  font-size: 1.5em;
}

.category-name {
  font-size: 1.1em;
  font-weight: 500;
  color: #333;
}

.edit-icon {
  font-size: 1.2em;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0.7;
}

.edit-icon:hover {
  opacity: 1;
  transform: scale(1.1);
  color: #1976d2;
}

.description-icon {
  font-size: 1.2em;
  opacity: 0;
  pointer-events: none;
  transition: all 0.2s;
  cursor: pointer;
  color: #666;
}

.description-icon.visible {
  opacity: 0.7;
  pointer-events: auto;
}

.description-icon.visible:hover {
  opacity: 1;
  transform: scale(1.1);
  color: #1976d2;
}

.category-description {
  font-style: italic;
  color: #555;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
  background-color: #f9f9f9;
  padding: 12px;
  border-radius: 6px;
}
</style>
