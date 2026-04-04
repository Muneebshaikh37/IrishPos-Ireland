<template>
  <div class="mt-5 space-y-2">
    <label class="block text-sm font-medium text-slate-700">{{ $t('brand.name') }}</label>
    <FormInput
        v-model="localBrand.name"
        type="text"
        class="mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm"
    />
    <template v-if="form.invalid('name')">
      <div class="mt-2 text-sm text-red-600">{{ form.getError('name') }}</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import FormInput from "@/components/Base/Form/FormInput.vue";
import { useI18n } from "vue-i18n";

const props = defineProps({
  initialBrand: {
    type: Object,
    required: true,
  },
  form: {
    type: Object,
    required: true, // Ensure `form` is always passed
  },
});

const { t } = useI18n();
const emits = defineEmits(["update:brand"]);

const localBrand = ref({ ...props.initialBrand });

watch(
    () => props.initialBrand,
    (newVal) => {
      localBrand.value = { ...newVal };
    },
    { immediate: true, deep: true }
);

watch(
    localBrand,
    (newVal) => {
      if (JSON.stringify(newVal) !== JSON.stringify(props.initialBrand)) {
        emits("update:brand", newVal);
      }
    },
    { deep: true }
);
</script>
