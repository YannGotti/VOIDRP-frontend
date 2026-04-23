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
      <section v-if="!auth.ready.value && !hidePublicShell" class="py-16 md:py-24">
        <div class="container-shell max-w-3xl">
          <div class="surface-card p-6 text-center md:p-10">
            <div class="section-kicker">VoidRP</div>
            <h1 class="section-title">Открываем сайт</h1>
            <p class="section-subtitle mx-auto max-w-2xl">
              Проверяем сохранённый вход и подгружаем кабинет, чтобы ты сразу попал в нужный раздел.
            </p>
            <div class="mt-6 flex justify-center text-violet-300">
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
