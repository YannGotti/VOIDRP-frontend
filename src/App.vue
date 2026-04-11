<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SiteNavbar from './components/SiteNavbar.vue'
import { useAuthStore } from './stores/authStore'

const auth = useAuthStore()
const route = useRoute()

const hidePublicNavbar = computed(() => {
  return route.path === '/internal-admin' || route.path.startsWith('/internal-admin/')
})
</script>

<template>
  <div data-theme="dark" class="site-root min-h-screen text-slate-100">
    <SiteNavbar v-if="!hidePublicNavbar" />

    <main class="relative z-10">
      <section v-if="!auth.ready.value && !hidePublicNavbar" class="py-24 md:py-32">
        <div class="container-shell max-w-3xl">
          <div class="surface-card p-8 text-center md:p-12">
            <div class="section-kicker">VoidRP</div>
            <h1 class="section-title">Подготавливаем сайт</h1>
            <p class="section-subtitle mx-auto max-w-2xl">
              Проверяем сохранённый вход и собираем тёмный player-first интерфейс, чтобы страница открылась сразу в нормальном состоянии.
            </p>
            <div class="mt-8 flex justify-center text-violet-400">
              <span class="spinner spinner-lg"></span>
            </div>
          </div>
        </div>
      </section>

      <RouterView v-else />
    </main>

    <footer v-if="!hidePublicNavbar" class="relative z-10 mt-12 pb-10 pt-4">
      <div class="container-shell">
        <div class="surface-card flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-7">
          <div>
            <p class="text-xl font-black tracking-tight text-slate-50">VoidRP</p>
            <p class="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
              Официальный лаунчер, карта мира, публичные профили и понятный путь к игре — теперь в цельной тёмной теме.
            </p>
          </div>

          <div class="flex flex-wrap gap-3 text-sm">
            <a href="https://void-rp.ru" target="_blank" rel="noreferrer" class="footer-chip">
              void-rp.ru
            </a>
            <a href="https://void-rp.ru/map" target="_blank" rel="noreferrer" class="footer-chip">
              Карта мира
            </a>
            <span class="footer-chip">Minecraft 1.21.1</span>
            <span class="footer-chip">Better MC 5</span>
          </div>
        </div>

        <div class="mt-4 text-center text-xs text-slate-500">
          © 2026 VoidRP. mironoouv.
        </div>
      </div>
    </footer>
  </div>
</template>
