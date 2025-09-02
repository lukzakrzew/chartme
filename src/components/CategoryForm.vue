<template>
  <q-card class="q-pa-lg">
    <q-card-section>
      <div class="text-h6 q-mb-md">
        {{ isEditMode ? "Edit Category" : "Create Category" }}
      </div>

      <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
        <q-input
          v-model="form.name"
          label="Name"
          outlined
          :rules="[
            (val) => !!val || 'Name is required',
            (val) =>
              validateName(val) ||
              'Name can only contain letters, digits, and spaces',
          ]"
          required
        />

        <q-input
          v-model="form.description"
          label="Description"
          type="textarea"
          outlined
          rows="3"
          placeholder="Optional description..."
        />

        <div>
          <div class="text-subtitle2 q-mb-sm">Icon</div>
          <IconPicker
            v-model="form.icon"
            :preview-color="form.color"
            title="Choose Category Icon"
          />
        </div>

        <div>
          <div class="text-subtitle2 q-mb-sm">Color</div>
          <div class="color-picker">
            <q-btn
              v-for="colorOption in colorOptions"
              :key="colorOption.name"
              :color="colorOption.name"
              :unelevated="form.color === colorOption.name"
              :outline="form.color !== colorOption.name"
              @click="form.color = colorOption.name"
              class="color-btn"
              round
              size="md"
            >
              <q-tooltip>{{ colorOption.label }}</q-tooltip>
            </q-btn>
          </div>
          <div class="q-mt-sm text-caption text-grey-6">
            Selected:
            {{
              colorOptions.find((c) => c.name === form.color)?.label ||
              form.color
            }}
          </div>
        </div>

        <div class="row q-gutter-sm q-mt-md justify-center">
          <q-btn
            :label="isEditMode ? 'Update Category' : 'Save Category'"
            color="primary"
            type="submit"
            :icon="isEditMode ? 'update' : 'save'"
          />
          <q-btn label="Cancel" color="grey" flat @click="onCancel" />
          <q-btn
            v-if="isEditMode"
            label="Reset"
            color="orange"
            flat
            @click="resetForm"
          />
        </div>

        <div v-if="errorMessage" class="text-negative q-mt-md">
          {{ errorMessage }}
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { reactive, ref, defineEmits, defineExpose } from "vue";
import { useLogsStore } from "@/stores/Logs";
import IconPicker from "@/components/IconPicker.vue";
import type { Category } from "@/types";

const emit = defineEmits<{
  cancel: [];
  saved: [category: Category];
}>();

const logsStore = useLogsStore();

const form = reactive({
  name: "",
  description: "",
  icon: "category" as string,
  color: "primary" as string,
});

const errorMessage = ref("");
const isEditMode = ref(false);
const editingCategory = ref<string | null>(null);

// Available colors for categories
const colorOptions = [
  { name: "primary", label: "Blue" },
  { name: "secondary", label: "Purple" },
  { name: "accent", label: "Teal" },
  { name: "positive", label: "Green" },
  { name: "negative", label: "Red" },
  { name: "warning", label: "Orange" },
  { name: "info", label: "Light Blue" },
  { name: "dark", label: "Dark" },
  { name: "pink", label: "Pink" },
  { name: "purple", label: "Deep Purple" },
  { name: "indigo", label: "Indigo" },
  { name: "cyan", label: "Cyan" },
  { name: "teal", label: "Teal" },
  { name: "lime", label: "Lime" },
  { name: "amber", label: "Amber" },
  { name: "brown", label: "Brown" },
];

function validateName(name: string): boolean {
  // Allow only letters, digits, and spaces
  const nameRegex = /^[a-zA-Z0-9\s]+$/;
  return nameRegex.test(name) && name.trim().length > 0;
}

function onSubmit() {
  errorMessage.value = "";

  // Validate name format
  if (!validateName(form.name)) {
    errorMessage.value = "Name can only contain letters, digits, and spaces";
    return;
  }

  // Check for duplicate names (only if not editing or name changed)
  if (!isEditMode.value || editingCategory.value !== form.name) {
    const duplicateName = logsStore.getCategory(form.name);
    if (duplicateName) {
      errorMessage.value = "Category with this name already exists";
      return;
    }
  }

  // Check for duplicate icon+color combinations (exclude current category when editing)
  const duplicateIconColor = logsStore.categories.find(
    (c) =>
      c.icon === form.icon &&
      c.color === form.color &&
      (!isEditMode.value || c.name !== editingCategory.value)
  );
  if (duplicateIconColor) {
    const colorLabel =
      colorOptions.find((co) => co.name === form.color)?.label || form.color;
    errorMessage.value = `${colorLabel} "${form.icon}" icon is already used by category "${duplicateIconColor.name}"`;
    return;
  }

  const categoryData: Category = {
    name: form.name,
    description: form.description || undefined,
    icon: form.icon,
    color: form.color,
  };

  if (isEditMode.value && editingCategory.value) {
    // Update existing category
    logsStore.updateCategory(editingCategory.value, categoryData);
  } else {
    // Save new category
    logsStore.addCategory(categoryData);
  }

  emit("saved", categoryData);

  // Reset form and mode
  resetForm();
}

function onReset() {
  resetForm();
}

function resetForm() {
  form.name = "";
  form.description = "";
  form.icon = "category";
  form.color = "primary";
  errorMessage.value = "";
  isEditMode.value = false;
  editingCategory.value = null;
}

function startEditCategory(category: Category) {
  form.name = category.name;
  form.description = category.description || "";
  form.icon = category.icon;
  form.color = category.color;
  isEditMode.value = true;
  editingCategory.value = category.name;
  errorMessage.value = "";

  // Scroll to top of form
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function onCancel() {
  emit("cancel");
}

// Expose methods for parent component
defineExpose({
  startEditCategory,
  resetForm,
});
</script>

<style scoped>
.q-card {
  max-width: 600px;
  margin: 0 auto;
}

/* Color Picker Styles */
.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.color-btn {
  width: 40px;
  height: 40px;
  transition: all 0.2s ease;
}

.color-btn:hover {
  transform: scale(1.1);
}
</style>
