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
    <div class="container-shell py-2.5 md:py-3">
      <div class="flex min-h-[62px] items-center justify-between gap-3 md:min-h-[66px]">
        <RouterLink to="/" class="group flex min-w-0 items-center gap-3">
          <div class="nav-logo-wrap">
            <img src="/logo.jpg" alt="VoidRP" class="h-full w-full object-cover" />
          </div>
          <div class="min-w-0">
            <div class="truncate text-[0.95rem] font-black tracking-tight text-slate-50 md:text-[1rem]">
              {{ siteConfig.serverName }}
            </div>
            <div class="truncate text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
              Better MC 5
            </div>
          </div>
        </RouterLink>

        <nav class="desktop-nav nav-list">
          <RouterLink to="/">Главная</RouterLink>
          <RouterLink to="/download-launcher">Скачать</RouterLink>
          <RouterLink to="/links">Ссылки</RouterLink>
          <RouterLink v-if="isAuthenticated" to="/profile">Профиль</RouterLink>
        </nav>

        <div class="desktop-actions items-center gap-2">
          <a :href="siteConfig.dynmapUrl" target="_blank" rel="noreferrer" class="btn btn-ghost btn-sm">Карта</a>

          <template v-if="!isAuthenticated">
            <RouterLink to="/login" class="btn btn-outline btn-sm">Войти</RouterLink>
            <RouterLink to="/register" class="btn btn-primary btn-sm">Создать аккаунт</RouterLink>
          </template>

          <template v-else>
            <RouterLink to="/profile" class="btn btn-outline btn-sm nav-user-btn">{{ displayName }}</RouterLink>
            <RouterLink to="/download-launcher" class="btn btn-primary btn-sm">Лаунчер</RouterLink>
            <button type="button" class="btn btn-ghost btn-sm" @click="handleLogout">Выйти</button>
          </template>
        </div>

        <button
          type="button"
          class="mobile-toggle btn btn-outline btn-sm"
          :aria-expanded="mobileOpen"
          @click="mobileOpen = !mobileOpen"
        >
          <span>{{ mobileOpen ? 'Закрыть' : 'Меню' }}</span>
        </button>
      </div>

      <transition name="fade">
        <div v-if="mobileOpen" class="mobile-menu mobile-only">
          <div class="grid gap-2">
            <RouterLink to="/" class="menu-link">Главная</RouterLink>
            <RouterLink to="/launcher" class="menu-link">Лаунчер</RouterLink>
            <RouterLink to="/download-launcher" class="menu-link">Скачать лаунчер</RouterLink>
            <RouterLink to="/links" class="menu-link">Полезные ссылки</RouterLink>
            <a :href="siteConfig.dynmapUrl" target="_blank" rel="noreferrer" class="menu-link">Карта мира</a>
          </div>

          <div class="mt-3 grid gap-2 border-t border-white/10 pt-3">
            <template v-if="!isAuthenticated">
              <RouterLink to="/login" class="btn btn-outline btn-sm">Войти</RouterLink>
              <RouterLink to="/register" class="btn btn-primary btn-sm">Создать аккаунт</RouterLink>
            </template>

            <template v-else>
              <RouterLink to="/profile" class="btn btn-outline btn-sm">Кабинет</RouterLink>
              <RouterLink to="/download-launcher" class="btn btn-primary btn-sm">Лаунчер</RouterLink>
              <button type="button" class="btn btn-ghost btn-sm" @click="handleLogout">Выйти</button>
            </template>
          </div>
        </div>
      </transition>
    </div>
  </header>
</template>
