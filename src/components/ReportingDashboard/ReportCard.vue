<script setup>
defineProps({
    to: Object,
    title: String,
    description: String,
    icon: [Object, Function],
})
</script>

<template>
    <router-link :to="to"
        class="bg-white p-6 rounded-lg shadow-md border border-gray-200 relative hover:scale-105 transition-transform duration-300 ease-in-out text-center">
        <div class="flex justify-center mb-4">
            <component :is="icon" class="w-10 h-10 text-primary" />
        </div>
        <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ title }}</h3>
        <p class="text-sm text-gray-600">{{ description }}</p>
    </router-link>
</template>
