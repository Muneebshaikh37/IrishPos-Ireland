<script setup lang="ts">
import "@/assets/css/themes/enigma/side-nav.css";
import logoUrl from "@/assets/images/logo-jaldi.png";
import { useRoute, useRouter } from "vue-router";
import Tippy from "@/components/Base/Tippy";
import Lucide from "@/components/Base/Lucide";
import TopBar from "@/components/Themes/Enigma/TopBar";
import MobileMenu from "@/components/MobileMenu";
import { useMenuStore } from "../../../stores/menu";
import { useAuthStore } from "@/stores/auth";
import {
  type ProvideForceActiveMenu,
  forceActiveMenu,
  type Route,
  type FormattedMenu,
  nestedMenu,
  linkTo,
  enter,
  leave,
} from "./side-menu";
import { watch, reactive, ref, computed, onMounted, provide } from "vue";

const route: Route = useRoute();
const router = useRouter();
let formattedMenu = reactive<Array<FormattedMenu | "divider">>([]);
const setFormattedMenu = (
  computedFormattedMenu: Array<FormattedMenu | "divider">
) => {
  Object.assign(formattedMenu, computedFormattedMenu);
};
const menuStore = useMenuStore();
const authStore = useAuthStore();
const menu = computed(() => nestedMenu(menuStore.menu("side-menu"), route));
const windowWidth = ref(window.innerWidth);
const sidebarStoreName = computed(
  () => authStore.user?.store_name || authStore.user?.name || "Storefront"
);
// Product Owner is a platform-level role; show brand logo instead of a name.
const isProductOwnerRole = computed(() => {
  const role = authStore.user?.role;
  const roles = (authStore.user as any)?.roles;
  return role === "Product Owner" || (Array.isArray(roles) && roles.includes("Product Owner"));
});

provide<ProvideForceActiveMenu>("forceActiveMenu", (pageName: string) => {
  forceActiveMenu(route, pageName);
  setFormattedMenu(menu.value);
});

watch(menu, () => {
  setFormattedMenu(menu.value);
});

watch(
  computed(() => route.path),
  () => {
    delete route.forceActiveMenu;
  }
);

onMounted(() => {
  setFormattedMenu(menu.value); 
  window.addEventListener("resize", () => {
    windowWidth.value = window.innerWidth;
  });
});

 

    const isActive = (menuItem: any) => {
      const currentPath = route.path; // Get the current route path
      if (menuItem.pageName === "All Products") {
        // Check if the route matches "Products" or "Create Products"
        return (
          currentPath === "/inventory/products" ||
          currentPath === "/inventory/products/create"
        );
      }
    }
</script>

<template>
  <div
    :class="[
      'enigma py-5 px-5 md:py-0 sm:px-8 md:px-0',
      'before:content-[\'\'] before:bg-gradient-to-b before:from-theme-1 before:to-theme-2 dark:before:from-darkmode-800 dark:before:to-darkmode-800 md:before:bg-none md:bg-slate-200 md:dark:bg-darkmode-800 before:fixed before:inset-0 before:z-[-1]',
    ]"
  >
    <MobileMenu />
    <TopBar layout="side-menu" />
    <div class="flex overflow-hidden">
      <!-- BEGIN: Side Menu -->
      <nav class="side-nav sidebar-refresh w-[100px] xl:w-[280px] px-4 pb-8 overflow-x-hidden z-50 pt-24 -mt-2 hidden md:block">
        <div class="rounded-3xl bg-primary/95 px-3 py-4 shadow-2xl ring-1 ring-white/20 backdrop-blur-sm">
          <div class="sidebar-brand mb-4 rounded-2xl bg-white/10 px-3 py-4">
            <div v-if="isProductOwnerRole" class="flex items-center justify-center">
              <img :src="logoUrl" alt="Logo" class="h-10 w-auto object-contain" />
            </div>
            <h2 v-else class="sidebar-store-name text-center">
              {{ sidebarStoreName }}
            </h2>
            <p class="mt-3 text-center text-xs font-medium uppercase tracking-wide text-white/80">Navigation</p>
          </div>

          <ul class="pb-2">
          <template v-for="(menu, menuKey) in formattedMenu">
            <li
              v-if="menu == 'divider'"
              type="li"
              class="my-6 side-nav__divider"
              :key="'divider-' + menuKey"
            ></li>
            <li v-else :key="menuKey">
              <Tippy
                as="a"
                :content="menu.title"
                :options="{
                  placement: 'right',
                }"
                :disable="windowWidth > 1260"
                :href="
                  menu.subMenu
                    ? '#'
                    : ((pageName: string | undefined) => {
                        try {
                          return router.resolve({
                            name: pageName,
                          }).fullPath;
                        } catch (err) {
                          return '';
                        }
                      })(menu.pageName)
                "
                @click="(event: MouseEvent) => {
                  event.preventDefault();
                  linkTo(menu, router);
                  setFormattedMenu([...formattedMenu]);
                }"
                :class="[
                  menu.active ? 'side-menu side-menu--active' : 'side-menu',
                ]"
              >
                <div class="side-menu__icon">
                  <Lucide :icon="menu.icon" />
                </div>
                <div class="side-menu__title">
                  {{ menu.title }}
                  <div
                    v-if="menu.subMenu"
                    :class="[
                      'side-menu__sub-icon',
                      { 'transform rotate-180': menu.activeDropdown },
                    ]"
                  >
                    <Lucide icon="ChevronDown" />
                  </div>
                </div>
              </Tippy>
              <Transition @enter="enter" @leave="leave">
                <ul
                  v-if="menu.subMenu && menu.activeDropdown"
                  :class="{ 'side-menu__sub-open': menu.activeDropdown }"
                >
                  <li
                    v-for="(subMenu, subMenuKey) in menu.subMenu"
                    :key="subMenuKey"
                  >
                    <Tippy
                      as="a"
                      :content="subMenu.title"
                      :options="{
                        placement: 'right',
                      }"
                      :disable="windowWidth > 1260"
                      :href="
                        subMenu.subMenu
                          ? '#'
                          : ((pageName: string | undefined) => {
                              try {
                                return router.resolve({
                                  name: pageName,
                                }).fullPath;
                              } catch (err) {
                                return '';
                              }
                            })(subMenu.pageName)
                      "
                      :class="[
                        subMenu.active
                          ? 'side-menu side-menu--active'
                          : 'side-menu',
                      ]"
                      @click="(event: MouseEvent) => {
                        event.preventDefault();
                        linkTo(subMenu, router);
                        setFormattedMenu([...formattedMenu]);
                      }"
                    >
                      <div class="side-menu__icon">
                        <Lucide :icon="subMenu.icon" />
                      </div>
                      <div class="side-menu__title">
                        {{ subMenu.title }}
                        <div
                          v-if="subMenu.subMenu"
                          :class="[
                            'side-menu__sub-icon',
                            {
                              'transform rotate-180': subMenu.activeDropdown,
                            },
                          ]"
                        >
                          <Lucide icon="ChevronDown" />
                        </div>
                      </div>
                    </Tippy>
                    <Transition
                      @enter="enter"
                      @leave="leave"
                      v-if="subMenu.subMenu"
                    >
                      <ul
                        v-if="subMenu.subMenu && subMenu.activeDropdown"
                        :class="{
                          'side-menu__sub-open': subMenu.activeDropdown,
                        }"
                      >
                        <li
                          v-for="(
                            lastSubMenu, lastSubMenuKey
                          ) in subMenu.subMenu"
                          :key="lastSubMenuKey"
                        >
                          <Tippy
                            as="a"
                            :content="lastSubMenu.title"
                            :options="{
                              placement: 'right',
                            }"
                            :disable="windowWidth > 1260"
                            :href="
                              lastSubMenu.subMenu
                                ? '#'
                                : ((pageName: string | undefined) => {
                                    try {
                                      return router.resolve({
                                        name: pageName,
                                      }).fullPath;
                                    } catch (err) {
                                      return '';
                                    }
                                  })(lastSubMenu.pageName)
                            "
                            :class="[
                              lastSubMenu.active
                                ? 'side-menu side-menu--active'
                                : 'side-menu',
                            ]"
                            @click="(event: MouseEvent) => {
                              event.preventDefault();
                              linkTo(lastSubMenu, router);
                              setFormattedMenu([...formattedMenu]);
                            }"
                          >
                            <div class="side-menu__icon">
                              <Lucide :icon="lastSubMenu.icon" />
                            </div>
                            <div class="side-menu__title">
                              {{ lastSubMenu.title }}
                            </div>
                          </Tippy>
                        </li>
                      </ul>
                    </Transition>
                  </li>
                </ul>
              </Transition>
            </li>
          </template>
          </ul>

          <div class="sidebar-footer rounded-2xl bg-white/10 px-3 py-3 text-white/85">
            <p class="text-xs font-medium uppercase tracking-wide text-white/70">Need help?</p>
            <p class="mt-1 text-xs leading-5">Contact support if you face any issue while managing your store.</p>
          </div>
        </div>
      </nav>
      <!-- END: Side Menu -->
      <!-- BEGIN: Content -->
      <div
        :class="[
          'max-w-full md:max-w-none rounded-[30px] md:rounded-none px-4 md:px-[22px] min-w-0 min-h-screen bg-slate-100 flex-1 md:pt-20 pb-10 mt-5 md:mt-1 relative dark:bg-darkmode-700',
          'before:content-[\'\'] before:w-full before:h-px before:block',
        ]"
      >
        <RouterView />
      </div>
      <!-- END: Content -->
    </div>
  </div>
</template>

<style scoped>
.sidebar-refresh :deep(.side-nav__divider) {
  background-color: rgba(255, 255, 255, 0.22);
  margin: 0.75rem 0;
}

.sidebar-refresh .sidebar-brand,
.sidebar-refresh .sidebar-footer {
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.sidebar-refresh .sidebar-store-name {
  font-size: 1.125rem;
  line-height: 1.45rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.01em;
  word-break: break-word;
}

.sidebar-refresh :deep(.side-menu) {
  height: 46px;
  border-radius: 14px;
  padding-left: 0.85rem;
  margin-bottom: 0.35rem;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.2s ease;
}

.sidebar-refresh :deep(.side-menu .side-menu__icon) {
  color: rgba(255, 255, 255, 0.9);
}

.sidebar-refresh :deep(.side-menu .side-menu__title) {
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
}

.sidebar-refresh :deep(.side-menu:hover:not(.side-menu--active):not(.side-menu--open)) {
  background-color: rgba(255, 255, 255, 0.14);
  transform: translateX(2px);
}

.sidebar-refresh :deep(> ul > li > .side-menu.side-menu--active) {
  background-color: #ffffff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14);
}

.sidebar-refresh :deep(> ul > li > .side-menu.side-menu--active .side-menu__icon),
.sidebar-refresh :deep(> ul > li > .side-menu.side-menu--active .side-menu__title) {
  color: rgb(30 41 59);
}

.sidebar-refresh :deep(> ul > li > ul) {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 0.35rem 0.25rem;
  margin-bottom: 0.5rem;
}

.sidebar-refresh :deep(> ul > li > ul > li > .side-menu) {
  height: 42px;
  margin-bottom: 0.2rem;
}

.sidebar-refresh :deep(> ul > li > ul > li > .side-menu.side-menu--active) {
  background-color: rgba(255, 255, 255, 0.2);
}

.sidebar-refresh :deep(> ul > li > ul > li > .side-menu.side-menu--active .side-menu__icon),
.sidebar-refresh :deep(> ul > li > ul > li > .side-menu.side-menu--active .side-menu__title) {
  color: #ffffff;
}

.sidebar-refresh :deep(.side-menu::before),
.sidebar-refresh :deep(.side-menu::after),
.sidebar-refresh :deep(> ul > li > ul::before),
.sidebar-refresh :deep(> ul > li > ul > li > ul::before) {
  display: none !important;
}
</style>
