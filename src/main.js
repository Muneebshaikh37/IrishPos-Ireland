import './assets/main.css'
import PrimeVue from 'primevue/config';
  
import { createApp } from 'vue'
import App from './App.vue'
import VueApexCharts from "vue3-apexcharts";

createApp(App).use(VueApexCharts).use(PrimeVue).mount('#app')
