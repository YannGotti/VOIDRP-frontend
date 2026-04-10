<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { siteConfig } from '../config.site'
import { logoutCurrentSession, useAuthStore } from '../stores/authStore'

const auth = useAuthStore()
const route = useRoute()
const mobileOpen = ref(false)

const isAuthenticated = computed(() => auth.isAuthenticated.value)
const displayName = computed(() => auth.displayName.value)

watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false
  },
)

async function handleLogout() {
  mobileOpen.value = false
  await logoutCurrentSession()
}
</script>

<template>
  <header class="nav-shell sticky top-0 z-50">
    <div class="container-shell py-3">
      <div class="flex min-h-[68px] items-center justify-between gap-3">
        <RouterLink to="/" class="group flex min-w-0 items-center gap-3">
          <div class="h-11 w-11 overflow-hidden rounded-2xl border border-indigo-200 bg-white shadow-[0_10px_30px_rgba(67,83,255,0.12)] transition-transform duration-200 group-hover:scale-[1.03]">
            <img src="/logo.jpg" alt="VoidRP" class="h-full w-full object-cover" />
          </div>
          <div class="min-w-0">
            <div class="truncate text-base font-black tracking-tight text-slate-950 md:text-lg">{{ siteConfig.serverName }}</div>
            <div class="truncate text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
              Better MC 5
            </div>
          </div>
        </RouterLink>

        <nav class="nav-list hidden xl:flex">
          <RouterLink to="/">Главная</RouterLink>
          <RouterLink to="/launcher">О лаунчере</RouterLink>
          <RouterLink to="/download-launcher">Скачать</RouterLink>
          <RouterLink to="/links">Ссылки</RouterLink>
          <RouterLink v-if="isAuthenticated" to="/profile">Кабинет</RouterLink>
        </nav>

        <div class="hidden items-center gap-2 lg:flex">
          <a :href="siteConfig.dynmapUrl" target="_blank" rel="noreferrer" class="btn btn-ghost btn-sm">
            Карта
          </a>

          <template v-if="!isAuthenticated">
            <RouterLink to="/login" class="btn btn-outline btn-sm">Войти</RouterLink>
            <RouterLink to="/register" class="btn btn-primary btn-sm">Создать аккаунт</RouterLink>
          </template>

          <template v-else>
            <RouterLink to="/profile" class="btn btn-outline btn-sm">
              {{ displayName }}
            </RouterLink>
            <RouterLink to="/download-launcher" class="btn btn-primary btn-sm">Лаунчер</RouterLink>
            <button type="button" class="btn btn-ghost btn-sm" @click="handleLogout">Выйти</button>
          </template>
        </div>

        <button
          type="button"
          class="btn btn-outline btn-sm lg:hidden"
          :aria-expanded="mobileOpen"
          @click="mobileOpen = !mobileOpen"
        >
          <span>{{ mobileOpen ? 'Закрыть' : 'Меню' }}</span>
        </button>
      </div>

      <transition name="fade">
        <div v-if="mobileOpen" class="mobile-menu lg:hidden">
          <div class="grid gap-2">
            <RouterLink to="/" class="menu-link">Главная</RouterLink>
            <RouterLink to="/launcher" class="menu-link">О лаунчере</RouterLink>
            <RouterLink to="/download-launcher" class="menu-link">Скачать лаунчер</RouterLink>
            <RouterLink to="/links" class="menu-link">Полезные ссылки</RouterLink>
            <a :href="siteConfig.dynmapUrl" target="_blank" rel="noreferrer" class="menu-link">
              Карта мира
            </a>
          </div>

          <div class="mt-3 grid gap-2 border-t border-slate-200 pt-3">
            <template v-if="!isAuthenticated">
              <RouterLink to="/login" class="btn btn-outline">Войти</RouterLink>
              <RouterLink to="/register" class="btn btn-primary">Создать аккаунт</RouterLink>
            </template>

            <template v-else>
              <RouterLink to="/profile" class="btn btn-outline">Кабинет</RouterLink>
              <button type="button" class="btn btn-ghost" @click="handleLogout">Выйти</button>
            </template>
          </div>
        </div>
      </transition>
    </div>
  </header>
</template>
