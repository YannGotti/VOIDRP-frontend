<script setup>
import SiteNavbar from './components/SiteNavbar.vue'
import { useAuthStore } from './stores/authStore'

const auth = useAuthStore()
</script>

<template>
  <div data-theme="light" class="site-root min-h-screen text-slate-900">
    <div class="bg-orb bg-orb-1"></div>
    <div class="bg-orb bg-orb-2"></div>
    <div class="bg-grid"></div>

    <SiteNavbar />

    <main class="relative z-10">
      <section v-if="!auth.ready.value" class="py-20 md:py-28">
        <div class="container-shell max-w-2xl">
          <div class="glass-card rounded-[32px] p-8 md:p-10 text-center">
            <div class="section-kicker">VoidRP</div>
            <h1 class="section-title">Подготавливаем сайт</h1>
            <p class="section-subtitle">
              Проверяем вход и загружаем твою страницу.
            </p>
            <div class="mt-8 flex justify-center">
              <span class="loading loading-spinner loading-lg text-primary"></span>
            </div>
          </div>
        </div>
      </section>

      <RouterView v-else />
    </main>

    <footer class="relative z-10 mt-16 border-t border-slate-200/80 bg-white/70 backdrop-blur-xl">
      <div class="container-shell py-10">
        <div
          class="flex flex-col gap-6 rounded-[28px] border border-slate-200 bg-white/85 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p class="text-xl font-black tracking-wide text-slate-900">VoidRP</p>
            <p class="mt-2 text-sm leading-6 text-slate-600">
              Лаунчер, карта мира и главная информация о сервере в одном месте.
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

        <div class="mt-5 text-center text-xs text-slate-500">
          © 2026 VoidRP. Все права защищены. @mironoouv.
        </div>
      </div>
    </footer>
  </div>
</template>
