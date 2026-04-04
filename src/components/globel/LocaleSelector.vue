<template>
  <div class="w-24 z-50">
    <Listbox v-model="selectedLocale">
      <div class="relative mr-4">
        <ListboxButton
            class="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary/30 sm:text-sm"
        >
          <span class="block truncate capitalize">{{ selectedLocale }}</span>
          <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <Lucide icon="ChevronDown" class="w-5 h-5 text-gray-400 dark:text-slate-500" />
          </span>
        </ListboxButton>

        <transition
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
          <ListboxOptions
              class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
          >
            <ListboxOption
                v-slot="{ active, selected }"
                v-for="locale in availableLocales"
                :key="`locale-${locale}`"
                :value="locale"
                as="template"
            >
              <li
                  :class="[active ? 'bg-primary text-white' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-4 pr-4']"
              >
                <span
                    :class="[selected ? 'font-medium capitalize' : 'font-normal capitalize', 'block truncate']"
                >
                  {{ locale }}
                </span>
              </li>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/vue";
import Lucide from "@/components/Base/Lucide";
import { useI18n } from "vue-i18n";

// Get i18n locales and current locale
const { availableLocales, locale } = useI18n();

// Load the locale from localStorage or default to 'en'
const savedLocale = localStorage.getItem("locale") || "en";
locale.value = savedLocale; // Set the i18n locale
const selectedLocale = ref(savedLocale); // Bind to Listbox

// Watch for changes in selectedLocale and update the locale
watch(selectedLocale, (newLocale) => {
  console.log("Changing locale to:", newLocale);
  localStorage.setItem("locale", newLocale); // Save to localStorage
  locale.value = newLocale; // Update the i18n locale
  window.location.reload(); // Reload to apply changes
});
</script>