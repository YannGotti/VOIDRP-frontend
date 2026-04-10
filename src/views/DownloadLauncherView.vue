<script setup>
import { computed } from 'vue'
import { siteConfig } from '../config.site'
import { useAuthStore } from '../stores/authStore'

const auth = useAuthStore()
const isAuthenticated = computed(() => auth.isAuthenticated.value)
</script>

<template>
  <section class="py-12 md:py-18">
    <div class="container-shell space-y-6">
      <div class="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
        <div class="surface-card p-6 md:p-8 lg:p-10">
          <div class="section-kicker">Лаунчер</div>
          <h1 class="section-title">Скачать официальный лаунчер VoidRP</h1>
          <p class="section-subtitle">
            Это основной способ входа на сервер. Лаунчер сам подготовит игру и запустит нужную сборку без лишней ручной настройки.
          </p>

          <div class="mt-8 rounded-[1.6rem] border border-slate-200 bg-slate-50/90 p-5">
            <div class="metric-label">Твой статус</div>
            <div class="mt-3 text-2xl font-black tracking-tight text-slate-950">
              {{ isAuthenticated ? 'Можно скачивать и заходить' : 'Сначала создай аккаунт или войди' }}
            </div>
            <p class="mt-3 text-sm leading-7 text-slate-600">
              <template v-if="isAuthenticated">
                Ты вошёл как <strong>{{ auth.displayName.value }}</strong>. Теперь можно скачать лаунчер и использовать тот же аккаунт для входа.
              </template>
              <template v-else>
                Сначала зарегистрируйся или войди в уже существующий аккаунт. После этого путь к игре станет прямым и понятным.
              </template>
            </p>

            <div v-if="isAuthenticated && !auth.emailVerified.value" class="alert alert-warn mt-4">
              Почта ещё не подтверждена. Играть это обычно не мешает, но лучше завершить этот шаг заранее.
            </div>
          </div>

          <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              v-if="isAuthenticated"
              :href="siteConfig.launcherPortableUrl"
              target="_blank"
              rel="noreferrer"
              class="btn btn-primary"
            >
              Скачать лаунчер
            </a>
            <RouterLink v-else to="/register" class="btn btn-primary">Создать аккаунт</RouterLink>
            <RouterLink v-if="!isAuthenticated" to="/login" class="btn btn-outline">Войти</RouterLink>
            <RouterLink v-if="isAuthenticated" to="/profile" class="btn btn-outline">Открыть кабинет</RouterLink>
            <RouterLink v-if="isAuthenticated && !auth.emailVerified.value" to="/verify-email" class="btn btn-ghost">
              Подтвердить почту
            </RouterLink>
          </div>
        </div>

        <div class="gradient-panel p-6 md:p-8 lg:p-10">
          <div class="section-kicker section-kicker--light">Как начать</div>
          <h2 class="text-3xl font-black tracking-tight text-white md:text-4xl">Что делать дальше</h2>

          <div class="mt-6 grid gap-3">
            <div class="rounded-[1.3rem] border border-white/10 bg-white/10 p-4">
              <p class="text-sm font-black text-white">1. Аккаунт</p>
              <p class="mt-2 text-sm leading-7 text-white/78">Укажи логин, почту и свой игровой ник.</p>
            </div>
            <div class="rounded-[1.3rem] border border-white/10 bg-white/10 p-4">
              <p class="text-sm font-black text-white">2. Лаунчер</p>
              <p class="mt-2 text-sm leading-7 text-white/78">Скачай его и войди под тем же аккаунтом.</p>
            </div>
            <div class="rounded-[1.3rem] border border-white/10 bg-white/10 p-4">
              <p class="text-sm font-black text-white">3. Играй</p>
              <p class="mt-2 text-sm leading-7 text-white/78">Лаунчер проверит файлы, подготовит клиент и запустит игру.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
