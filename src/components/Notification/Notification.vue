<script setup>

import { ref, onMounted, inject, defineProps } from "vue";
import { init, reInit } from "./notification";
import Toastify from "toastify-js";

// export interface NotificationElement extends HTMLDivElement {
//   toastify: ReturnType<typeof Toastify>;
//   showToast: () => void;
//   hideToast: () => void;
// }

// export interface NotificationProps extends HTMLAttributes {
//   options?: Options;
//   refKey?: string;
// }

// export type ProvideNotification = (el) => void;

const props = defineProps(['options','refKey'])


const toastifyRef = ref();

const bindInstance = (el) => {
  if (props.refKey) {
    const bind = inject(`bind[${props.refKey}]`);
    
    if (bind) {
      bind(el);
    }
  }
};


const vNotificationDirective = {
  mounted(el) {
    init(el, props);
  },
  updated(el) {
    reInit(el);
  },
};

onMounted(() => {
  if (toastifyRef.value) {
    bindInstance(toastifyRef.value);
  }
});
</script>

<template>
  <div 
    class="hidden-NO"  v-notification-directive  ref="toastifyRef">
    <slot></slot>
  </div>
</template>

<style>
 
</style>
