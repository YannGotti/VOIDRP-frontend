<script setup>
import { computed } from 'vue'
import { siteConfig } from '../config.site'
import { useAuthStore } from '../stores/authStore'

const auth = useAuthStore()
const isAuthenticated = computed(() => auth.isAuthenticated.value)
</script>

<template>
  <section class="py-16 md:py-24">
    <div class="container-shell">
      <div class="max-w-3xl">
        <div class="section-kicker">Лаунчер</div>
        <h1 class="section-title">Скачать официальный лаунчер VoidRP</h1>
        <p class="section-subtitle">
          Это главный способ входа на сервер. Лаунчер сам подготовит игру и запустит нужную сборку.
        </p>
      </div>

      <div class="mt-10 grid gap-6 lg:grid-cols-2">
        <div class="glass-card rounded-[32px] p-8">
          <div class="mb-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-500">
            Твой статус
          </div>
          <h2 class="text-2xl font-black text-slate-900">
            {{ isAuthenticated ? 'Можно скачивать' : 'Сначала создай аккаунт' }}
          </h2>
          <p class="mt-4 leading-7 text-slate-600">
            <template v-if="isAuthenticated">
              Ты вошёл как <strong>{{ auth.displayName.value }}</strong>. Теперь можно скачать лаунчер и войти в него под тем же аккаунтом.
            </template>
            <template v-else>
              Сначала зарегистрируйся или войди в уже существующий аккаунт. После этого путь к игре станет проще и понятнее.
            </template>
          </p>

          <div
            v-if="isAuthenticated && !auth.emailVerified.value"
            class="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            Почта ещё не подтверждена. Играть это пока не мешает, но лучше завершить этот шаг заранее.
          </div>

          <div class="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              v-if="isAuthenticated"
              :href="siteConfig.launcherPortableUrl"
              target="_blank"
              rel="noreferrer"
              class="btn btn-primary rounded-2xl"
            >
              Скачать лаунчер
            </a>
            <RouterLink v-else to="/register" class="btn btn-primary rounded-2xl">Создать аккаунт</RouterLink>
            <RouterLink v-if="!isAuthenticated" to="/login" class="btn btn-outline rounded-2xl">Войти</RouterLink>
            <RouterLink v-if="isAuthenticated" to="/profile" class="btn btn-outline rounded-2xl">Открыть профиль</RouterLink>
            <RouterLink v-if="isAuthenticated && !auth.emailVerified.value" to="/verify-email" class="btn btn-ghost rounded-2xl">Подтвердить почту</RouterLink>
          </div>
        </div>

        <div class="glass-card rounded-[32px] p-8">
          <div class="mb-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-500">
            Как начать
          </div>
          <h2 class="text-2xl font-black text-slate-900">Что делать дальше</h2>
          <div class="mt-6 grid gap-4">
            <div class="build-info-card">
              <p class="build-info-card__label">1. Создай аккаунт</p>
              <p class="build-info-card__value">Укажи логин, почту и свой игровой ник</p>
            </div>
            <div class="build-info-card">
              <p class="build-info-card__label">2. Скачай лаунчер</p>
              <p class="build-info-card__value">Войди в него под тем же аккаунтом</p>
            </div>
            <div class="build-info-card">
              <p class="build-info-card__label">3. Нажми «Играть»</p>
              <p class="build-info-card__value">Лаунчер сам проверит файлы и запустит игру</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
