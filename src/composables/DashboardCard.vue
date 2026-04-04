<template>
  <div
      :class="[
      'relative zoom-in h-full',
      'before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-[\'\']',
      wrapperClass
    ]"
  >
    <div class="p-5 box h-full">
      <slot />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  wrapperClass: {
    type: String,
    default: "",
  },
});
</script>
