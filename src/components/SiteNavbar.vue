<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { siteConfig } from '../config.site'
import { externalNavigation, primaryNavigation } from '../config/navigation'
import { logoutCurrentSession, useAuthStore } from '../stores/authStore'

const auth = useAuthStore()
const route = useRoute()
const mobileOpen = ref(false)

const isAuthenticated = computed(() => auth.isAuthenticated.value)
const displayName = computed(() => auth.displayName.value || 'Профиль')
const minecraftNick = computed(() => auth.state.playerAccount?.minecraft_nickname || null)
const userInitial = computed(() => {
  const name = auth.displayName.value || ''
  return name.charAt(0).toUpperCase() || '?'
})

const navItems = primaryNavigation
const externalItems = externalNavigation

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
        <!-- Brand -->
        <RouterLink to="/" class="site-navbar__brand">
          <div class="site-navbar__logo">
            <img src="/logo.jpg" alt="VoidRP" class="site-navbar__logo-image" />
          </div>
          <div class="site-navbar__brand-text">
            <div class="site-navbar__title">{{ siteConfig.serverName }}</div>
            <div class="site-navbar__meta">MC {{ siteConfig.serverVersion }} · Better MC 5 · {{ siteConfig.serverIp }}</div>
          </div>
        </RouterLink>

        <!-- Desktop nav -->
        <nav class="site-navbar__desktop-nav">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="site-navbar__link"
            :class="{ 'site-navbar__link--active': isActive(item) }"
          >
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-if="item.icon" class="site-navbar__link-icon" v-html="item.icon" />
            {{ item.label }}
          </RouterLink>
        </nav>

        <!-- Right section: external links + auth -->
        <div class="site-navbar__actions site-navbar__actions--desktop">
          <!-- External links -->
          <a
            v-for="item in externalItems"
            :key="item.href"
            :href="item.href"
            target="_blank"
            rel="noreferrer"
            class="site-navbar__ext-link"
          >
            {{ item.label }}
          </a>

          <div class="site-navbar__divider" />

          <!-- Auth -->
          <template v-if="isAuthenticated">
            <RouterLink to="/profile" class="site-navbar__avatar-btn">
              <span class="site-navbar__avatar">{{ userInitial }}</span>
              <span class="site-navbar__avatar-name">{{ minecraftNick || displayName }}</span>
            </RouterLink>
            <button type="button" class="btn btn-ghost btn-sm" @click="handleLogout">
              Выйти
            </button>
          </template>

          <template v-else>
            <RouterLink to="/login" class="btn btn-outline btn-sm">Войти</RouterLink>
            <RouterLink to="/register" class="btn btn-primary btn-sm">Создать</RouterLink>
          </template>
        </div>

        <!-- Mobile toggle -->
        <button
          type="button"
          class="btn btn-outline btn-sm site-navbar__menu-toggle"
          :aria-expanded="mobileOpen ? 'true' : 'false'"
          @click="mobileOpen = !mobileOpen"
        >
          <!-- Hamburger icon -->
          <svg v-if="!mobileOpen" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <!-- X icon -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Mobile panel -->
      <transition name="fade">
        <div v-if="mobileOpen" class="site-navbar__mobile-panel surface-card">
          <div class="site-navbar__mobile-links">
            <RouterLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="site-navbar__mobile-link"
            >
              <!-- eslint-disable-next-line vue/no-v-html -->
              <span v-if="item.icon" class="site-navbar__link-icon" v-html="item.icon" />
              {{ item.label }}
            </RouterLink>

            <a
              v-for="item in externalItems"
              :key="item.href"
              :href="item.href"
              target="_blank"
              rel="noreferrer"
              class="site-navbar__mobile-link"
            >
              {{ item.label }}
            </a>
          </div>

          <div class="site-navbar__mobile-actions">
            <template v-if="isAuthenticated">
              <RouterLink to="/profile" class="btn btn-outline">
                <span class="site-navbar__avatar site-navbar__avatar--sm">{{ userInitial }}</span>
                {{ minecraftNick || displayName }}
              </RouterLink>
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

<style scoped>
.site-navbar__link-icon {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  opacity: 0.75;
}

.site-navbar__link:hover .site-navbar__link-icon,
.site-navbar__link--active .site-navbar__link-icon {
  opacity: 1;
}

.site-navbar__link {
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
}

.site-navbar__mobile-link {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.site-navbar__ext-link {
  padding: 0.45rem 0.75rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: #8ea0c4;
  border-radius: 999px;
  transition: color 0.2s ease, background 0.2s ease;
}

.site-navbar__ext-link:hover {
  color: #cbd5ea;
  background: rgba(255, 255, 255, 0.05);
}

.site-navbar__divider {
  width: 1px;
  height: 1.4rem;
  background: rgba(148, 163, 184, 0.16);
  flex-shrink: 0;
}

/* Avatar button (profile link) */
.site-navbar__avatar-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.3rem 0.75rem 0.3rem 0.3rem;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.04);
  transition: border-color 0.2s ease, background 0.2s ease;
  text-decoration: none;
}

.site-navbar__avatar-btn:hover {
  border-color: rgba(139, 92, 246, 0.28);
  background: rgba(139, 92, 246, 0.08);
}

.site-navbar__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 900;
  flex-shrink: 0;
  line-height: 1;
}

.site-navbar__avatar--sm {
  width: 1.6rem;
  height: 1.6rem;
  font-size: 0.72rem;
}

.site-navbar__avatar-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #e5eefc;
  max-width: 9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
