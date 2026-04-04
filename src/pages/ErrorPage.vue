<script setup lang="ts">
import ThemeSwitcher from "@/components/ThemeSwitcher";
import errorIllustration from "@/assets/images/404.svg";
import Button from "@/components/Base/Button";
import { RouterLink } from "vue-router";
</script>

<template>
  <div class=" bg-gradient-to-b from-theme-1 to-theme-2 dark:from-darkmode-800 dark:to-darkmode-800"> 
    <div class="container">
      <!-- BEGIN: Error Page -->
      <div class="h-screen text-center error-page flex items-center justify-center"> 
        <div class=" text-white lg:mt-0">
          <div class="font-semibold text-8xl rotate-[-9deg]">404</div>
          <div class="-intro-x  ">
          <img alt="Midone Tailwind HTML Admin Template"  class="w-[400px] h-48 lg:h-auto mx-auto -my-8 pl-4" :src="errorIllustration"
          />
        </div>
          <div class="mt-5 text-xl font-semibold intro-x lg:text-5xl">
            Ooops...
          </div>
          <div class="mt-3 text-xl font-normal intro-x lg:text-4xl">
            Page Not Found
          </div>
          <div class="mt-3 text-lg intro-x">
            Sorry, the page you’re looking for doesn’t exist or the resource may have been moved <br>to a different location.
          </div>
          <Button
            class="px-4 py-3 mt-10 text-white border-white intro-x dark:border-darkmode-400 dark:text-slate-200"
          >
            <RouterLink to="/">
            Back to Home
            </RouterLink>
          </Button>
        </div>
      </div>
      <!-- END: Error Page -->
    </div>
  </div>
</template>
