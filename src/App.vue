<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppFooter from './components/AppFooter.vue'
import GlobalToastStack from './components/GlobalToastStack.vue'
import SiteNavbar from './components/SiteNavbar.vue'
import { useAuthStore } from './stores/authStore'

const auth = useAuthStore()
const route = useRoute()

const hidePublicShell = computed(() => Boolean(route.meta?.hidePublicShell))
</script>

<template>
  <div data-theme="dark" class="site-root min-h-screen text-slate-100">
    <SiteNavbar v-if="!hidePublicShell" />

    <main class="site-main">
      <section v-if="!auth.ready.value && !hidePublicShell" class="py-9 md:py-12">
        <div class="container-shell max-w-3xl">
          <div class="surface-card p-5 text-center md:p-6">
            <div class="section-kicker">VoidRP</div>
            <h1 class="section-title">Открываем сайт</h1>
            <p class="section-subtitle mx-auto max-w-2xl">
              Проверяем сохранённый вход и загружаем кабинет.
            </p>
            <div class="mt-4 flex justify-center text-violet-300">
              <span class="spinner spinner-lg"></span>
            </div>
          </div>
        </div>
      </section>

      <RouterView v-else />
    </main>

    <AppFooter v-if="!hidePublicShell" />
    <GlobalToastStack />
  </div>
</template>

<style>
:root {
  --compact-shell-width: 1180px;
}

.container-shell {
  max-width: var(--compact-shell-width);
}

.site-main {
  padding-top: 0.1rem;
}

.surface-card,
.gradient-panel,
.action-card,
.metric-card,
.dark-list-card {
  border-radius: 1.35rem !important;
}

.surface-card {
  padding: 1rem;
}

.section-kicker {
  margin-bottom: 0.4rem !important;
  font-size: 0.68rem !important;
  letter-spacing: 0.18em !important;
}

.section-title {
  font-size: clamp(1.55rem, 2.4vw, 2.25rem) !important;
  line-height: 1.02 !important;
}

.section-subtitle {
  margin-top: 0.6rem !important;
  font-size: 0.95rem !important;
  line-height: 1.65 !important;
}

.btn {
  min-height: 2.8rem !important;
  padding-inline: 1rem !important;
  border-radius: 0.95rem !important;
}

.btn.btn-sm {
  min-height: 2.3rem !important;
  padding-inline: 0.85rem !important;
}

.input,
.textarea,
.select {
  min-height: 2.8rem !important;
  border-radius: 0.95rem !important;
}

.metric-card,
.action-card,
.dark-list-card {
  padding: 0.9rem !important;
}

.metric-label {
  font-size: 0.67rem !important;
}

.metric-value {
  font-size: 1.3rem !important;
  line-height: 1.05 !important;
}

.footer-chip,
.hero-chip,
.inline-chip {
  min-height: 2rem !important;
  padding: 0.4rem 0.7rem !important;
  font-size: 0.72rem !important;
}

.site-navbar {
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(16px);
}

.site-navbar__shell {
  min-height: 4.25rem !important;
  gap: 0.85rem !important;
}

.site-navbar__brand {
  gap: 0.75rem !important;
}

.site-navbar__logo {
  height: 2.6rem !important;
  width: 2.6rem !important;
}

.site-navbar__title {
  font-size: 1rem !important;
  line-height: 1 !important;
}

.site-navbar__meta {
  font-size: 0.7rem !important;
  line-height: 1.35 !important;
}

.site-navbar__desktop-nav {
  gap: 0.4rem !important;
}

.site-navbar__link {
  padding: 0.55rem 0.78rem !important;
  font-size: 0.82rem !important;
}

.site-navbar__mobile-panel {
  margin-top: 0.55rem !important;
  padding: 0.85rem !important;
}

.site-navbar__mobile-links,
.site-navbar__mobile-actions {
  gap: 0.55rem !important;
}

.preview-avatar {
  border-radius: 1.1rem !important;
}

@media (max-width: 768px) {
  .container-shell {
    padding-inline: 0.9rem !important;
  }

  .surface-card,
  .gradient-panel {
    padding: 0.95rem !important;
  }

  .section-title {
    font-size: 1.55rem !important;
  }
}
</style>
