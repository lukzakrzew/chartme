<template>
  <q-page class="q-pa-md">
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
      <q-input
        v-model="form.name"
        label="Name"
        :rules="[
          (val) => !!val || 'Name is required',
          (val) =>
            validateName(val) ||
            'Name can only contain letters, digits, and spaces',
        ]"
        required
      />

      <q-input v-model="form.desc" label="description" type="textarea" />

      <q-select
        v-model="form.type"
        label="Type"
        :options="Object.values(LOG_TYPES)"
        :rules="[(val) => !!val || 'Type is required']"
        required
        @input-value="onTypeChange"
      />

      <q-input
        v-model.number="form.min"
        label="Min"
        type="number"
        :disable="form.type === LOG_TYPES.boolean"
      />

      <q-input
        v-model.number="form.max"
        label="Max"
        type="number"
        :disable="form.type === LOG_TYPES.boolean"
      />

      <div class="row q-gutter-sm">
        <q-btn label="Submit" color="primary" type="submit" />
        <q-btn label="Reset" color="secondary" type="reset" flat />
      </div>
      <div class="error-message">
        {{ errorMessage }}
      </div>
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { LOG_TYPES } from "@/constants.ts";
import { useRouter } from "vue-router";
import { useLogsStore } from "@/stores/Logs";

const router = useRouter();
const logsStore = useLogsStore();

const form = reactive({
  name: "",
  desc: "",
  type: LOG_TYPES.number as LOG_TYPES,
  min: undefined as number | undefined,
  max: undefined as number | undefined,
});
const errorMessage = ref("");

function onTypeChange(type: string) {
  if (type === LOG_TYPES.boolean) {
    form.min = undefined;
    form.max = undefined;
  }
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
  if (
    form.type === LOG_TYPES.number &&
    typeof form.min === "number" &&
    typeof form.max === "number" &&
    form?.min > form?.max
  ) {
    errorMessage.value = "Min value cannot be greateer than max";
    return;
  }
  logsStore.addLogType({
    name: form.name,
    type: form.type,
    min: form.min,
    max: form.max,
  });
  router.push({ path: "/" });
}

function onReset() {
  form.name = "";
  form.type = LOG_TYPES.number;
  form.min = undefined;
  form.max = undefined;
}
</script>
