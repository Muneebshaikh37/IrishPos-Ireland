<script setup lang="ts">
import { useThemeStore, getTheme, themes, type Themes } from "@/stores/theme";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useRoute } from "vue-router";
import { onMounted, computed } from "vue";

const route = useRoute();
const Component = computed(() => getTheme(themeStore.theme).component);

const themeStore = useThemeStore();
const switchTheme = (theme: Themes["name"]) => {
  useThemeStore().setTheme(theme);
};

// onMounted(() => {
//   const theme = route.query.theme as Themes["name"];
//   if (
//     route.query.theme !== undefined &&
//     themes.map((theme) => theme.name).includes(theme)
//   ) {
//     switchTheme(theme);
//   }
// });
onMounted(() => {
  // Only override from URL when explicitly provided.
  // Otherwise keep store/localStorage-selected theme.
  const queryTheme = route.query.theme as Themes["name"] | undefined;
  if (queryTheme && themes.map((t) => t.name).includes(queryTheme)) {
    switchTheme(queryTheme);
  }
});
</script>

<template>
  <div>
    <!-- <ThemeSwitcher /> -->
    <Component />
  </div>
</template>
