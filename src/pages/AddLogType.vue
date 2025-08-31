<template>
  <q-page class="q-pa-md">
    <q-card class="q-pa-lg">
      <q-card-section>
        <div class="text-h6 q-mb-md">Create Log Type</div>

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
            v-model="form.desc"
            label="Description"
            type="textarea"
            outlined
            rows="3"
            placeholder="Optional description..."
          />

          <q-select
            v-model="form.type"
            label="Type"
            :options="Object.values(LOG_TYPES)"
            :rules="[(val) => !!val || 'Type is required']"
            required
            outlined
            @input-value="onTypeChange"
          />

          <q-toggle
            v-model="form.zeroToTen"
            label="Zero to ten scale"
            :disable="form.type === LOG_TYPES.boolean"
          />

          <div>
            <div class="text-subtitle2 q-mb-sm">Frequency</div>
            <q-option-group
              v-model="frequencyOption"
              :options="frequencyOptions"
              type="radio"
              inline
              @input="onFrequencyOptionChange"
            />
            <q-input
              v-if="frequencyOption === 'custom'"
              v-model.number="form.frequency"
              label="Custom frequency (days)"
              type="number"
              outlined
              :rules="[
                (val) => val > 0 || 'Frequency must be greater than 0',
                (val) =>
                  Number.isInteger(val) || 'Frequency must be a whole number',
              ]"
              class="q-mt-sm"
              min="1"
            />
          </div>

          <q-select
            v-model="form.category"
            label="Category (Optional)"
            :options="categoryOptions"
            option-value="name"
            option-label="name"
            clearable
            emit-value
            map-options
            outlined
          />

          <div class="row q-gutter-sm q-mt-md justify-center">
            <q-btn
              label="Save Log Type"
              color="primary"
              type="submit"
              icon="save"
            />
            <q-btn label="Cancel" color="grey" flat @click="onCancel" />
            <q-btn label="Reset" color="orange" flat type="reset" />
          </div>

          <div v-if="errorMessage" class="text-negative q-mt-md">
            {{ errorMessage }}
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { LOG_TYPES } from "@/constants.ts";
import { useRouter } from "vue-router";
import { useLogsStore } from "@/stores/Logs";

const router = useRouter();
const logsStore = useLogsStore();

const form = reactive({
  name: "",
  desc: "",
  type: LOG_TYPES.number as LOG_TYPES,
  frequency: 1,
  zeroToTen: false,
  category: undefined as string | undefined,
});
const errorMessage = ref("");
const frequencyOption = ref("daily");

const categoryOptions = computed(() => logsStore.categories);

const frequencyOptions = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Custom", value: "custom" },
];

function onTypeChange(type: string) {
  if (type === LOG_TYPES.boolean) {
    form.zeroToTen = false;
  }
}

function onFrequencyOptionChange(option: string) {
  if (option === "daily") {
    form.frequency = 1;
  } else if (option === "weekly") {
    form.frequency = 7;
  }
  // For custom, we keep whatever value is in the frequency field
}

function validateName(name: string): boolean {
  // Allow only letters, digits, and spaces
  const nameRegex = /^[a-zA-Z0-9\s]+$/;
  return nameRegex.test(name) && name.trim().length > 0;
}

function onSubmit() {
  // Validate name format
  if (!validateName(form.name)) {
    errorMessage.value = "Name can only contain letters, digits, and spaces";
    return;
  }

  const duplicate = logsStore.getLogType(form.name);
  if (duplicate) {
    errorMessage.value = "Log type with this name already exists";
    return;
  }

  // Validate frequency for custom option
  if (
    frequencyOption.value === "custom" &&
    (!form.frequency || form.frequency <= 0)
  ) {
    errorMessage.value = "Please enter a valid custom frequency greater than 0";
    return;
  }

  logsStore.addLogType({
    name: form.name,
    type: form.type,
    desc: form.desc,
    frequency: form.frequency,
    zeroToTen: form.zeroToTen,
    category: form.category,
    aggrs: {}, // Initialize empty aggregations
    archived: false, // Default to not archived
  });
  router.push({ path: "/" });
}

function onReset() {
  form.name = "";
  form.desc = "";
  form.type = LOG_TYPES.number;
  form.frequency = 1;
  form.zeroToTen = false;
  form.category = undefined;
  frequencyOption.value = "daily";
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
</style>
