<template>
  <div>
    <q-btn
      :icon="selectedIcon"
      :color="previewColor"
      outline
      @click="showIconPicker = true"
      class="full-width q-py-md"
    >
      <slot>{{ selectedIcon }}</slot>
    </q-btn>

    <!-- Icon Picker Modal -->
    <q-dialog v-model="showIconPicker" persistent>
      <q-card style="min-width: 400px; max-width: 600px">
        <q-card-section>
          <div class="text-h6">{{ title }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="icon-grid">
            <q-btn
              v-for="iconOption in iconOptions"
              :key="iconOption"
              :icon="iconOption"
              :color="selectedIcon === iconOption ? previewColor : previewColor"
              :unelevated="selectedIcon === iconOption"
              :outline="selectedIcon !== iconOption"
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
          <q-btn flat label="Cancel" color="grey" @click="onCancel" />
          <q-btn
            unelevated
            label="Select"
            color="primary"
            @click="onConfirm"
            :disable="!selectedIcon"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

interface Props {
  modelValue: string;
  previewColor?: string;
  title?: string;
  iconOptions?: string[];
}

interface Emits {
  (e: "update:modelValue", value: string): void;
  (e: "confirm", value: string): void;
  (e: "cancel"): void;
}

const props = withDefaults(defineProps<Props>(), {
  previewColor: "primary",
  title: "Choose an Icon",
  iconOptions: () => [
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
  ],
});

const emit = defineEmits<Emits>();

const showIconPicker = ref(false);
const selectedIcon = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newValue) => {
    selectedIcon.value = newValue;
  }
);

function selectIcon(iconName: string) {
  selectedIcon.value = iconName;
}

function onConfirm() {
  emit("update:modelValue", selectedIcon.value);
  emit("confirm", selectedIcon.value);
  showIconPicker.value = false;
}

function onCancel() {
  selectedIcon.value = props.modelValue; // Reset to original value
  emit("cancel");
  showIconPicker.value = false;
}
</script>

<style scoped>
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
</style>
