<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { siteConfig } from '../config.site'
import { externalNavigation, primaryNavigation } from '../config/navigation'
import { logoutCurrentSession, useAuthStore } from '../stores/authStore'

const auth = useAuthStore()
const route = useRoute()
const mobileOpen = ref(false)
const openGroup = ref(null)
const navRef = ref(null)

const isAuthenticated = computed(() => auth.isAuthenticated.value)
const displayName = computed(() => auth.displayName.value || 'Профиль')
const minecraftNick = computed(() => auth.state.playerAccount?.minecraft_nickname || null)
const avatarUrl = computed(() => auth.avatarUrl.value)
const userInitial = computed(() => {
  const name = auth.displayName.value || ''
  return name.charAt(0).toUpperCase() || '?'
})

const navItems = primaryNavigation
const externalItems = externalNavigation

function isLeafActive(item) {
  if (!item.to) return false
  if (item.to === '/') return route.path === '/'
  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}

function isActive(item) {
  if (item.to) return isLeafActive(item)
  return item.children?.some((c) => isLeafActive(c)) ?? false
}

function toggleGroup(label) {
  openGroup.value = openGroup.value === label ? null : label
}

function handleOutsideClick(e) {
  if (navRef.value && !navRef.value.contains(e.target)) {
    openGroup.value = null
  }
}

function closeDropdown() {
  openGroup.value = null
}

onMounted(() => document.addEventListener('mousedown', handleOutsideClick))
onUnmounted(() => document.removeEventListener('mousedown', handleOutsideClick))

watch(() => route.fullPath, () => {
  mobileOpen.value = false
  openGroup.value = null
})

async function handleLogout() {
  mobileOpen.value = false
  await logoutCurrentSession()
}
</script>

<template>
  <header class="site-navbar" ref="navRef">
    <div class="container-shell">
      <div class="site-navbar__shell">

        <!-- Brand -->
        <RouterLink to="/" class="site-navbar__brand">
          <div class="site-navbar__logo">
            <img src="/logo.jpg" alt="VoidRP" class="site-navbar__logo-image" />
          </div>
          <div class="site-navbar__brand-text">
            <div class="site-navbar__title">{{ siteConfig.serverName }}</div>
            <div class="site-navbar__meta">MC {{ siteConfig.serverVersion }} · {{ siteConfig.serverIp }}</div>
          </div>
        </RouterLink>

        <!-- Desktop nav -->
        <nav class="site-navbar__desktop-nav">
          <template v-for="item in navItems" :key="item.label">

            <!-- Simple link -->
            <RouterLink
              v-if="item.to"
              :to="item.to"
              class="site-navbar__link"
              :class="{ 'site-navbar__link--active': isActive(item) }"
            >
              <!-- eslint-disable-next-line vue/no-v-html -->
              <span v-if="item.icon" class="site-navbar__link-icon" v-html="item.icon" />
              {{ item.label }}
            </RouterLink>

            <!-- Dropdown group -->
            <div v-else class="site-navbar__dropdown-wrap">
              <button
                type="button"
                class="site-navbar__link site-navbar__dropdown-btn"
                :class="{ 'site-navbar__link--active': isActive(item) || openGroup === item.label }"
                @click="toggleGroup(item.label)"
              >
                <!-- eslint-disable-next-line vue/no-v-html -->
                <span v-if="item.icon" class="site-navbar__link-icon" v-html="item.icon" />
                {{ item.label }}
                <svg
                  class="site-navbar__chevron"
                  :class="{ 'site-navbar__chevron--open': openGroup === item.label }"
                  xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              <!-- Dropdown panel -->
              <Transition name="dropdown">
                <div v-if="openGroup === item.label" class="site-navbar__dropdown">
                  <RouterLink
                    v-for="child in item.children"
                    :key="child.to"
                    :to="child.to"
                    class="site-navbar__dropdown-item"
                    :class="{ 'site-navbar__dropdown-item--active': isLeafActive(child) }"
                    @click="closeDropdown"
                  >
                    <!-- eslint-disable-next-line vue/no-v-html -->
                    <span class="site-navbar__dropdown-item-icon" v-html="child.icon" />
                    <span class="site-navbar__dropdown-item-text">
                      <span class="site-navbar__dropdown-item-label">{{ child.label }}</span>
                      <span v-if="child.desc" class="site-navbar__dropdown-item-desc">{{ child.desc }}</span>
                    </span>
                  </RouterLink>
                </div>
              </Transition>
            </div>

          </template>
        </nav>

        <!-- Right: external + auth -->
        <div class="site-navbar__actions site-navbar__actions--desktop">
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

          <template v-if="isAuthenticated">
            <RouterLink to="/profile" class="site-navbar__avatar-btn">
              <span class="site-navbar__avatar">
                <img v-if="avatarUrl" :src="avatarUrl" :alt="displayName" class="site-navbar__avatar-img" />
                <template v-else>{{ userInitial }}</template>
              </span>
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
          <svg v-if="!mobileOpen" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
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
            <template v-for="item in navItems" :key="item.label">
              <!-- Simple link -->
              <RouterLink
                v-if="item.to"
                :to="item.to"
                class="site-navbar__mobile-link"
              >
                <!-- eslint-disable-next-line vue/no-v-html -->
                <span v-if="item.icon" class="site-navbar__link-icon" v-html="item.icon" />
                {{ item.label }}
              </RouterLink>

              <!-- Group: label + children -->
              <template v-else>
                <div class="site-navbar__mobile-group-label">
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <span v-if="item.icon" class="site-navbar__link-icon" v-html="item.icon" />
                  {{ item.label }}
                </div>
                <RouterLink
                  v-for="child in item.children"
                  :key="child.to"
                  :to="child.to"
                  class="site-navbar__mobile-link site-navbar__mobile-link--child"
                >
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <span v-if="child.icon" class="site-navbar__link-icon" v-html="child.icon" />
                  {{ child.label }}
                </RouterLink>
              </template>
            </template>

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
                <span class="site-navbar__avatar site-navbar__avatar--sm">
                  <img v-if="avatarUrl" :src="avatarUrl" :alt="displayName" class="site-navbar__avatar-img" />
                  <template v-else>{{ userInitial }}</template>
                </span>
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

/* ── Dropdown trigger ─────────────────── */
.site-navbar__dropdown-wrap {
  position: relative;
}
.site-navbar__dropdown-btn {
  cursor: pointer;
  background: none;
  border: none;
  gap: 0.38rem;
}
.site-navbar__chevron {
  margin-left: 0.1rem;
  flex-shrink: 0;
  transition: transform 0.18s ease;
  opacity: 0.6;
}
.site-navbar__chevron--open {
  transform: rotate(180deg);
  opacity: 1;
}

/* ── Dropdown panel ───────────────────── */
.site-navbar__dropdown {
  position: absolute;
  top: calc(100% + 0.6rem);
  left: 50%;
  transform: translateX(-50%);
  min-width: 13rem;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(7, 11, 20, 0.92);
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
  padding: 0.45rem;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.site-navbar__dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem 0.75rem;
  border-radius: 12px;
  text-decoration: none;
  transition: background 0.15s ease;
}
.site-navbar__dropdown-item:hover {
  background: rgba(255, 255, 255, 0.07);
}
.site-navbar__dropdown-item--active {
  background: rgba(139, 92, 246, 0.15);
}
.site-navbar__dropdown-item-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: #8b9fc8;
  opacity: 0.8;
}
.site-navbar__dropdown-item--active .site-navbar__dropdown-item-icon {
  color: #a78bfa;
  opacity: 1;
}
.site-navbar__dropdown-item-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.site-navbar__dropdown-item-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #dbe7ff;
  white-space: nowrap;
}
.site-navbar__dropdown-item--active .site-navbar__dropdown-item-label {
  color: #c4b5fd;
}
.site-navbar__dropdown-item-desc {
  font-size: 0.72rem;
  color: #64748b;
  white-space: nowrap;
}

/* ── Dropdown transition ──────────────── */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-6px);
}

/* ── External link ────────────────────── */
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

/* ── Avatar button ────────────────────── */
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
.site-navbar__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 999px;
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

/* ── Mobile group label ───────────────── */
.site-navbar__mobile-group-label {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.5rem 0.95rem 0.2rem;
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
}
.site-navbar__mobile-link--child {
  padding-left: 2.2rem;
  font-size: 0.87rem;
}
</style>
