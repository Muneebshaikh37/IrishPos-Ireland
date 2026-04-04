<script setup lang="ts">
import "@/assets/css/themes/rubick/side-nav.css";
import { useRoute } from "vue-router";
import logoUrl from "@/assets/images/logo-jaldi.png";
import Lucide from "@/components/Base/Lucide";
import TopBar from "@/components/Themes/Rubick/TopBar";
import MobileMenu from "@/components/MobileMenu";
import { useMenuStore } from "@/stores/menu";
import {
  STATIC_SHOP_SIDE_MENU,
  STATIC_SUPERADMIN_SIDE_MENU,
} from "@/config/staticSideMenu";
import {
  type ProvideForceActiveMenu,
  forceActiveMenu,
  type Route,
  type FormattedMenu,
  nestedMenu,
  enter,
  leave,
} from "./side-menu";
import { watch, reactive, ref, computed, onMounted, provide } from "vue";
import { useI18n } from "vue-i18n";

const route: Route = useRoute();
const { t } = useI18n();
let formattedMenu = reactive<Array<FormattedMenu | "divider">>([]);
const setFormattedMenu = (
  computedFormattedMenu: Array<FormattedMenu | "divider">
) => {
  Object.assign(formattedMenu, computedFormattedMenu);
};
const menuStore = useMenuStore();
const menu = computed(() => nestedMenu(menuStore.menu("side-menu"), route));
const windowWidth = ref(window.innerWidth);

provide<ProvideForceActiveMenu>("forceActiveMenu", (pageName: string) => {
  forceActiveMenu(route, pageName);
  setFormattedMenu(isAllMenu.value);
});

watch(menu, () => {
  setFormattedMenu(isAllMenu.value);
});

watch(
  computed(() => route.path),
  () => {
    delete route.forceActiveMenu;
  }
);
const isAllMenu: any = ref()
function routeMatchesChild(child: any): boolean {
  if (child.page_name && route.name === child.page_name) {
    return true;
  }
  if (child.url && typeof child.url === "string") {
    const u = child.url;
    return route.path === u || route.path.startsWith(u + "/");
  }
  return false;
}

function buildStaticSideMenu() {
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;
  const isSuperAdmin =
    user?.role === "Super Admin" ||
    (Array.isArray(user?.roles) && user.roles.includes("Super Admin"));

  const base = isSuperAdmin ? STATIC_SUPERADMIN_SIDE_MENU : STATIC_SHOP_SIDE_MENU;
  const cloned = JSON.parse(JSON.stringify(base));
  isAllMenu.value = cloned.map((menu: any) => ({
    ...menu,
    is_parent: menu.children?.length
      ? menu.children.some((child: any) => routeMatchesChild(child))
      : false,
  }));
}

const isfetchSideNav = () => {
  buildStaticSideMenu();
};
const locale = ref('en'); // Default locale

// Helper function to translate menu titles
const translateMenuTitle = (title: string): string => {
  if (!title) return '';
  try {
    // Try to get translation from menu namespace
    const translationKey = `menu.${title}`;
    const translation = t(translationKey);
    // If translation is the same as the key (no translation found), return original title
    // vue-i18n returns the key if translation is not found
    if (translation === translationKey) {
      return title;
    }
    return translation;
  } catch (e) {
    // Fallback to original title if translation fails
    return title;
  }
};

watch(
  () => route.fullPath,
  () => {
    buildStaticSideMenu();
    setFormattedMenu(isAllMenu.value);
  }
);

onMounted(() => {
  isfetchSideNav();
  setFormattedMenu(isAllMenu.value);

  window.addEventListener("resize", () => {
    windowWidth.value = window.innerWidth;
  });
  locale.value = localStorage.getItem('locale') || 'en';
});


// Toggle dropdown menu
const toggleDropdown = (menuKey:any) => {
  isAllMenu.value = isAllMenu.value.map((menu:any, index:any) => {
    if (index === menuKey) {
      return { ...menu, is_parent: !menu.is_parent };
    }
    return { ...menu, is_parent: false }; // Close others
  });
};

const isChildActive = (children: any) =>
  children?.some((child: any) => routeMatchesChild(child));

const isSubMenuActive = (subMenu: any) => routeMatchesChild(subMenu);

  const handleMenuClick = (menuKey:any) => {
  isAllMenu.value = isAllMenu.value.map((menu:any, index:any) => ({
    ...menu,
    is_parent: index === menuKey, // Keep the clicked parent open
  }));
};

const cleanUrl = (url: any) => {
  if (!url) return ''; // Return an empty string if URL is null or undefined
  return url.replace(/^#/, ''); // Remove the leading '#'
};
const dummy = [1,2,3,4,5,6,7,8]
</script>

<template>
  <div :class="[
    'rubick px-5 sm:px-8 py-5',
    'before:content-[\'\'] before:bg-gradient-to-b before:from-theme-1 before:to-theme-2 dark:before:from-darkmode-800 dark:before:to-darkmode-800 before:fixed before:inset-0 before:z-[-1]',
  ]">
    <MobileMenu />
    <div class="mt-[4.7rem] flex md:mt-0">
      <!-- BEGIN: Side Menu -->
      <nav class="side-nav hidden md:block md:w-[200px] xl:w-[260px]  pb-16 overflow-x-hidden z-10" :class="{ 'px-0 side-nav-ar': locale === 'ar', 'px-5': locale !== 'ar' }">
        <RouterLink :to="{ name: 'dashboard' }" class="flex items-center pt-4  mt-3">
          <img alt="Tinker Tailwind HTML Admin Template" :src="logoUrl" />
        </RouterLink>
        <div class="my-6 side-nav__divider"></div>
        <ul v-if="isAllMenu">
           <li v-for="(menu, menuKey) in isAllMenu" :key="menuKey"  >

            <RouterLink :to="cleanUrl(menu.url)" v-if="menu.page_name === 'dashboard' || menu.status" class="cursor-pointer animate-no side-menu"
        :class="[
            menu.is_parent || isChildActive(menu.children) || (menu.page_name && $route.name === menu.page_name)
            ? 'side-menu--active'
            : 'side-menu',
        ]"
        @click="toggleDropdown(menuKey)" >
                <div class="side-menu__icon">
                  <Lucide  :icon="menu.icon" />
                </div>
                <div class="side-menu__title" :class="{ 'mr-3': locale === 'ar', '': locale !== 'ar' }">
                  {{ translateMenuTitle(menu.title) }}
                  <div
                    v-if="menu.children.length > 0"
                    :class="[
                      'side-menu__sub-icon',
                      { 'transform rotate-180': menu.is_parent },
                    ]"
                  >
                    <Lucide icon="ChevronDown" />
                  </div>
                </div>
            </RouterLink>
            <Transition @enter="enter" @leave="leave">
                <ul class="bg-all-dropdown"
                  v-if="menu.children && menu.is_parent"
                  :class="{ 'side-menu__sub-open': menu.is_parent }"
                >
                  <li class="all-li-height " :class="{ 'pr-3': locale === 'ar', '': locale !== 'ar' }" v-for="(subMenu, subMenuKey) in menu.children" :key="subMenuKey">
                    <RouterLink :disable="windowWidth > 1260" v-if="subMenu.status"  :to="subMenu.url" class="anchor-height z-[999]" :class="[ isSubMenuActive(subMenu) ? 'side-menu side-menu--active' : 'side-menu', ]"   @click="handleMenuClick(menuKey)">
                      <div class="side-menu__icon" :class="{ 'pl-2': locale === 'ar', '': locale !== 'ar' }">
                        <Lucide :icon="subMenu.icon" />
                      </div>
                      <div class="side-menu__title">
                        {{ translateMenuTitle(subMenu.title) }}
                      </div>
                    </RouterLink>

                  </li>
                </ul>
              </Transition>
          </li>
        </ul>
        <ul v-else>
          <li class="side-menu" v-for="item in dummy" :key="item">
            <div class="side-menu__icon">
              <div class="w-6 h-6 rounded-lg animate-pulse  bg-primary/60"></div>
            </div>
            <div class="side-menu__title">
              <div class="w-[100px] h-4 rounded-lg animate-pulse  bg-primary/60"></div>
            </div>
          </li>

        </ul>

      </nav>
      <!-- END: Side Menu -->
      <!-- BEGIN: Content -->
      <div
        class="md:max-w-auto min-h-screen min-w-0 max-w-full flex-1 rounded-[30px] bg-slate-100 px-4 pb-10 before:block before:h-px before:w-full before:content-[''] dark:bg-darkmode-700 md:px-[22px]">
        <TopBar />
        <RouterView />
      </div>
      <!-- END: Content -->
    </div>
  </div>
</template>

<style scoped>
.rubick .side-nav-ar > ul > li > .side-menu.side-menu--active:before{
right: inherit;
left: -0px;
transform: rotate(-180deg) scale(1.04);
}
.rubick .side-nav-ar > ul > li > .side-menu.side-menu--active:after{
right: inherit;
left: -0px;
transform: rotate(-90deg) scale(1.04);
}
.rubick .side-nav-ar > ul > li > .side-menu.side-menu--active .side-menu__icon:before {

    border-top-right-radius: 30px;
    border-bottom-right-radius: 30px;
}
.rubick .side-nav-ar .side-menu{
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
}
.rubick .side-nav-ar .side-menu .side-menu__title .side-menu__sub-icon{
      margin-right: auto;
      margin-left: inherit;
}
.bg-all-dropdown{
  background-color: #169B62 !important;
  margin-left: 15px;
  margin-top: 8px;
  margin-bottom: 14px;
}
/* .all-li-height {
    padding: 20px 0px;
} */
.all-li-height .anchor-height{
  height: 0px;
  padding-top: 20px;
  padding-bottom: 20px;
  padding-left: 12px;
}
</style>

