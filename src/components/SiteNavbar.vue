<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { siteConfig } from '../config.site'
import { logoutCurrentSession, useAuthStore } from '../stores/authStore'

const auth = useAuthStore()
const route = useRoute()
const mobileOpen = ref(false)

const isAuthenticated = computed(() => auth.isAuthenticated.value)
const displayName = computed(() => auth.displayName.value || 'Профиль')

const navItems = [
  { label: 'Главная', to: '/' },
  { label: 'Государства', to: '/nations' },
  { label: 'Рейтинг', to: '/nations/rankings' },
  { label: 'Ссылки', to: '/links' },
]

function isActive(item) {
  if (item.to === '/') {
    return route.path === '/'
  }

  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}

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
  <header class="site-navbar">
    <div class="container-shell">
      <div class="site-navbar__shell">
        <RouterLink to="/" class="site-navbar__brand">
          <div class="site-navbar__logo">
            <img src="/logo.jpg" alt="VoidRP" class="site-navbar__logo-image" />
          </div>

          <div class="site-navbar__brand-text">
            <div class="site-navbar__title">{{ siteConfig.serverName }}</div>
            <div class="site-navbar__meta">Better MC 5 · Minecraft {{ siteConfig.serverVersion }}</div>
          </div>
        </RouterLink>

        <nav class="site-navbar__desktop-nav">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="site-navbar__link"
            :class="{ 'site-navbar__link--active': isActive(item) }"
          >
            {{ item.label }}
          </RouterLink>

          <a
            :href="siteConfig.dynmapUrl"
            target="_blank"
            rel="noreferrer"
            class="site-navbar__link"
          >
            Карта
          </a>
        </nav>

        <div class="site-navbar__actions site-navbar__actions--desktop">
          <template v-if="isAuthenticated">
            <RouterLink to="/profile" class="btn btn-outline btn-sm site-navbar__profile-btn">
              {{ displayName }}
            </RouterLink>
            <button type="button" class="btn btn-ghost btn-sm" @click="handleLogout">
              Выйти
            </button>
          </template>

          <template v-else>
            <RouterLink to="/login" class="btn btn-outline btn-sm">Войти</RouterLink>
            <RouterLink to="/register" class="btn btn-primary btn-sm">Создать аккаунт</RouterLink>
          </template>
        </div>

        <button
          type="button"
          class="btn btn-outline btn-sm site-navbar__menu-toggle"
          :aria-expanded="mobileOpen ? 'true' : 'false'"
          @click="mobileOpen = !mobileOpen"
        >
          {{ mobileOpen ? 'Закрыть' : 'Меню' }}
        </button>
      </div>

      <transition name="fade">
        <div v-if="mobileOpen" class="site-navbar__mobile-panel surface-card">
          <div class="site-navbar__mobile-links">
            <RouterLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="site-navbar__mobile-link"
            >
              {{ item.label }}
            </RouterLink>

            <a
              :href="siteConfig.dynmapUrl"
              target="_blank"
              rel="noreferrer"
              class="site-navbar__mobile-link"
            >
              Карта
            </a>
          </div>

          <div class="site-navbar__mobile-actions">
            <template v-if="isAuthenticated">
              <RouterLink to="/profile" class="btn btn-outline">Профиль</RouterLink>
              <button type="button" class="btn btn-ghost" @click="handleLogout">Выйти</button>
            </template>

            <template v-else>
              <RouterLink to="/login" class="btn btn-outline">Войти</RouterLink>
              <RouterLink to="/register" class="btn btn-primary">Создать аккаунт</RouterLink>
            </template>
          </div>
        </div>
      </transition>
    </div>
  </header>
</template>
