<template>
  <p v-if="error" class="text-danger">{{ error }}</p>
</template>

<script>
export default {
  props: {
    error: {
      type: String,
      default: '',
    },
  },
};
</script>
