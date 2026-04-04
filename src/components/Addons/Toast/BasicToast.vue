<template>
    <!-- BEGIN: General Notification -->
    <Notification refKey="GeneralNotification" :options="toastStore.current?.options || {}" class="flex">
        <Lucide v-if="toastStore.current?.icon || false" :icon="toastStore.current?.icon || 'Anchor'"
            :class="`text-${toastStore.current.type}`" />
        <div v-if="toastStore.current?.message || false" class="ml-4 mr-4">
            <div :class="`font-medium text-${toastStore.current.type}`">{{ toastStore.current.subject }}</div>
            <div class="mt-1 text-slate-500">
                {{ toastStore.current.message }}
            </div>
        </div>
    </Notification>
    <!-- END: General Notification -->
</template>
<script setup lang="ts">
import { ref, provide, watch } from "vue";
import Notification, { NotificationElement } from "../../Base/Notification/index";
import Lucide from "../../Base/Lucide";
import toast from "../../../stores/utility/toast";

const GeneralNotificationReference = ref<NotificationElement>();
provide(`bind[GeneralNotification]`, (el: NotificationElement) => {
    GeneralNotificationReference.value = el;
})

const NotificationToggler = () => {
    GeneralNotificationReference.value?.showToast();
}

// Get the toast store instance
const toastStore = toast();

// Watch the logs array directly for reactivity
watch(() => toastStore.logs.length, (newLength, oldLength) => {
    if (newLength !== oldLength && newLength > 0) {
        setTimeout(() => {
            NotificationToggler();
        }, 10);
    }
}, { immediate: false })
</script>