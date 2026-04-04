import { useAuthStore } from './stores/auth';
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import VueApexCharts from "vue3-apexcharts";
import 'maz-ui/styles';
import "./assets/css/app.css";
import 'aos/dist/aos.css';
import { installToaster, ToasterOptions } from 'maz-ui';
import { abilitiesPlugin } from '@casl/vue';
import { createI18n } from "vue-i18n";

// Toaster default options
const toasterOptions: ToasterOptions = {
    position: 'top-right',
    timeout: 2000,
    persistent: false,
};

// Dynamically import all JSON files in the locales directory
const messages = {};
const locales = import.meta.glob("./locales/**/**.json", { eager: true });

for (const path in locales) {
    const match = path.match(/\.\/locales\/([a-z]{2})\/(.+)\.json$/); // Match 'locales/en/auth.json'
    if (match) {
        const lang = match[1]; // 'en' or 'ar'
        const namespace = match[2]; // 'auth' or 'dashboard'
        if (!messages[lang]) messages[lang] = {};
        messages[lang][namespace] = locales[path].default || locales[path];
    }
}

const savedLocale = localStorage.getItem("locale") || "en"; // Default to 'en' if no saved locale
const i18n = createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'en',
    messages,
    globalInjection: true,  // This makes __ globally accessible

});

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);

const authStore = useAuthStore();
const user = localStorage.getItem("user");
if (user) {
    try {
        const parsedUser = JSON.parse(user);
        authStore.user = parsedUser;
        // Safely check if permissions exist and is an array
        if (parsedUser.permissions && Array.isArray(parsedUser.permissions) && parsedUser.permissions.length > 0) {
            const rules = parsedUser.permissions.map((perm) => {
                const permissionName = typeof perm === 'string' ? perm : (perm?.name ?? perm);
                if (!permissionName || !String(permissionName).includes(':')) return null;
                const [subject, action] = String(permissionName).split(':');
                return { action: action.toLowerCase(), subject };
            }).filter(rule => rule !== null);
            // Give Admin and Super Admin full access (matches original behavior on reload)
            if (parsedUser.role === 'Super Admin' || parsedUser.role === 'Admin') {
                rules.push({ action: 'manage', subject: 'all' });
            }
            authStore.ability.update(rules);
        } else {
            authStore.ability.update([]);
        }
    } catch (error) {
        console.error('Error parsing user data:', error);
        authStore.ability.update([]);
    }
}

// Restore impersonation banner state if a backup exists
if (sessionStorage.getItem('impersonatorContext')) {
    authStore.impersonationActive = true;
}

async function bootstrap() {
    if (authStore.getUserId) {
        await authStore.syncCurrencySetting(authStore.getUserId);
    }

    app.use(abilitiesPlugin, authStore.ability);
    app.use(router)
        .use(installToaster, toasterOptions)
        .use(i18n)
        .use(VueApexCharts);

    app.mount("#app");
    i18n.global.locale.value = 'en';
}

void bootstrap();

