<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-lg">Add New Category</div>

    <q-card class="q-pa-lg">
      <q-card-section>
        <div class="text-h6 q-mb-md">Create Category</div>

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
            <q-label class="q-mb-sm">Icon</q-label>
            <q-btn
              :icon="form.icon"
              :color="form.color"
              outline
              @click="showIconPicker = true"
              class="full-width q-py-md"
            />
          </div>

          <div>
            <q-label class="q-mb-sm">Color</q-label>
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

          <div class="row q-gutter-sm q-mt-md">
            <q-btn
              label="Save Category"
              color="primary"
              type="submit"
              icon="save"
            />
            <q-btn label="Cancel" color="grey" flat @click="onCancel" />
          </div>

          <div v-if="errorMessage" class="text-negative q-mt-md">
            {{ errorMessage }}
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <!-- Categories List -->
    <q-card class="q-pa-lg q-mt-lg">
      <q-card-section>
        <div class="text-h6 q-mb-md">Existing Categories</div>

        <div v-if="logsStore.categories.length === 0" class="no-categories">
          No categories created yet
        </div>

        <div
          v-else
          v-for="category in logsStore.categories"
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
            v-if="
              category.description && expandedDescriptions.has(category.name)
            "
            class="category-description"
          >
            {{ category.description }}
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Icon Picker Modal -->
    <q-dialog v-model="showIconPicker" persistent>
      <q-card style="min-width: 400px; max-width: 600px">
        <q-card-section>
          <div class="text-h6">Choose an Icon</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="icon-grid">
            <q-btn
              v-for="iconOption in iconOptions"
              :key="iconOption"
              :icon="iconOption"
              :color="form.icon === iconOption ? form.color : form.color"
              :unelevated="form.icon === iconOption"
              :outline="form.icon !== iconOption"
              @click="selectIcon(iconOption)"
              class="icon-btn"
              size="lg"
              round
            >
              <q-tooltip>{{ iconOption }}</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="grey"
            @click="showIconPicker = false"
          />
          <q-btn
            unelevated
            label="Select"
            color="primary"
            @click="showIconPicker = false"
            :disable="!form.icon"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useLogsStore } from "@/stores/Logs";

const router = useRouter();
const logsStore = useLogsStore();

const form = reactive({
  name: "",
  description: "",
  icon: "category" as string,
  color: "primary" as string,
});

const errorMessage = ref("");
const showIconPicker = ref(false);
const expandedDescriptions = ref(new Set<string>());

// Common Material Design icons for categories
const iconOptions = [
  "category",
  "folder",
  "label",
  "bookmark",
  "star",
  "favorite",
  "work",
  "home",
  "school",
  "fitness_center",
  "restaurant",
  "shopping_cart",
  "directions_car",
  "flight",
  "hotel",
  "local_hospital",
  "music_note",
  "movie",
  "sports_esports",
  "camera_alt",
  "palette",
  "code",
  "science",
  "account_balance",
  "trending_up",
];

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

function selectIcon(iconName: string) {
  form.icon = iconName;
}

function toggleDescriptionVisibility(categoryName: string) {
  if (expandedDescriptions.value.has(categoryName)) {
    expandedDescriptions.value.delete(categoryName);
  } else {
    expandedDescriptions.value.add(categoryName);
  }
}

function onSubmit() {
  errorMessage.value = "";

  // Validate name format
  if (!validateName(form.name)) {
    errorMessage.value = "Name can only contain letters, digits, and spaces";
    return;
  }

  // Check for duplicate names
  const duplicateName = logsStore.getCategory(form.name);
  if (duplicateName) {
    errorMessage.value = "Category with this name already exists";
    return;
  }

  // Check for duplicate icon+color combinations
  const duplicateIconColor = logsStore.categories.find(
    (c) => c.icon === form.icon && c.color === form.color
  );
  if (duplicateIconColor) {
    const colorLabel =
      colorOptions.find((co) => co.name === form.color)?.label || form.color;
    errorMessage.value = `${colorLabel} "${form.icon}" icon is already used by category "${duplicateIconColor.name}"`;
    return;
  }

  // Save category
  logsStore.addCategory({
    name: form.name,
    description: form.description || undefined,
    icon: form.icon,
    color: form.color,
  });

  // Redirect to home
  router.push({ path: "/" });
}

function onReset() {
  form.name = "";
  form.description = "";
  form.icon = "category";
  form.color = "primary";
  errorMessage.value = "";
}

function onCancel() {
  router.push({ path: "/" });
}
</script>

<style scoped>
.q-card {
  max-width: 600px;
  margin: 0 auto;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(65px, 1fr));
  gap: 16px;
  padding: 20px;
  background: #fafafa;
  border-radius: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.icon-btn {
  width: 65px;
  height: 65px;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
}

.category-icon {
  font-size: 1.5em;
}

.category-name {
  font-size: 1.1em;
  font-weight: 500;
  color: #333;
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
