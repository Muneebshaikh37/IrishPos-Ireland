<template>
  <div class="form-group">
    <label :for="name">{{ label }}</label>
    <input
        :id="name"
        :type="type"
        :name="name"
        :value="modelValue"
       @input="updateValue"
       :class="{ 'is-invalid': error }"
    />
    <ValidationError :error="error" />
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue';
import ValidationError from "@/components/ValidationError.vue";

// Props: Accept the value being passed from the parent component
const props = defineProps({
  label: String,
  name: String,
  type: {
    type: String,
    default: 'text',
  },
  modelValue: [String, Number], // This will be the v-model value from the parent
  errors: {
    type: Object,
    default: () => ({}),
  },
});

// Emit the update to the parent when the input changes
const emit = defineEmits(['update:modelValue']);

// Computed property for error
const error = computed(() => props.errors[props.name]?.[0] || null);

// Method to handle input change and emit the update
const updateValue = (event) => {
  emit('update:modelValue', event.target.value);
};
</script>
