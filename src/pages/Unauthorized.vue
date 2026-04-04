<script setup lang="ts">
import ThemeSwitcher from "@/components/ThemeSwitcher";
import errorIllustration from "@/assets/images/error-illustration.svg";
import Button from "@/components/Base/Button";
import router from "@/router";


const goToHome = () => {
  router.push('/admin'); // Redirect to the home page
};
</script>


<template>
  <div
    class="py-2 bg-gradient-to-b from-theme-1 to-theme-2 dark:from-darkmode-800 dark:to-darkmode-800"
  >
    <ThemeSwitcher />
    <div class="container">
      <!-- BEGIN: Error Page -->
      <div
        class="flex flex-col items-center justify-center h-screen text-center error-page lg:flex-row lg:text-left"
      >
        <div class="-intro-x lg:mr-20">
          <img
            alt="Midone Tailwind HTML Admin Template"
            class="w-[450px] h-48 lg:h-auto"
            :src="errorIllustration"
          />
        </div>
        <div class="mt-10 text-white lg:mt-0">
          <div class="font-medium intro-x text-8xl">403</div>
          <div class="mt-5 text-xl font-medium intro-x lg:text-3xl">
            You do not have permission to access this page.
          </div>
          <div class="mt-3 text-lg intro-x">
            If you believe this is a mistake, please contact the administrator or try
            logging in with the appropriate account.
          </div>
          <Button @click="goToHome"
            class="px-4 py-3 mt-10 text-white border-white intro-x dark:border-darkmode-400 dark:text-slate-200"
          >
            Back to Home
          </Button>
        </div>
      </div>
      <!-- END: Error Page -->
    </div>
  </div>
</template>
