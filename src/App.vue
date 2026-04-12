<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppFooter from './components/AppFooter.vue'
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
      <section v-if="!auth.ready.value && !hidePublicShell" class="py-24 md:py-32">
        <div class="container-shell max-w-3xl">
          <div class="surface-card p-8 text-center md:p-12">
            <div class="section-kicker">VoidRP</div>
            <h1 class="section-title">Подготавливаем сайт</h1>
            <p class="section-subtitle mx-auto max-w-2xl">
              Проверяем сохранённый вход и собираем интерфейс так, чтобы страница
              открывалась сразу в аккуратном и понятном виде.
            </p>
            <div class="mt-8 flex justify-center text-violet-400">
              <span class="spinner spinner-lg"></span>
            </div>
          </div>
        </div>
      </section>

      <RouterView v-else />
    </main>

    <AppFooter v-if="!hidePublicShell" />
  </div>
</template>
