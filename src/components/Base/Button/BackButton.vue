<script setup>
import Button from "./Button.vue";
import { onMounted, ref } from "vue";
import Lucide from "@/components/Base/Lucide";

defineProps({
    to: {
        type: Object,
    },
    label: {
        type: String,
    },
    size: {
        type: String,
        default: "sm",
    }
})

const locale = ref('en');
onMounted(() => {
    locale.value = localStorage.getItem('locale') || 'en';
})
</script>

<template>
    <div class="px-6 flex items-center mt-8 intro-y">
        <router-link :to="to">
            <Button variant="primary" :size="size" class="shadow-md   h-8 w-9"
                :class="{ 'ml-4': locale === 'ar', 'mr-4': locale !== 'ar' }">
                <Lucide icon="ChevronLeft" class="w-5 h-5   " :class="{ 'rotate-180': locale === 'ar' }" />
            </Button>
        </router-link>
      <h1 v-if="label" class="text-lg font-medium">{{ $t(label) }}</h1>
    </div>
</template>
