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
        <h1 class="section-title">Скачай официальный лаунчер VoidRP</h1>
        <p class="section-subtitle">
          Здесь начинается путь в игру: сначала аккаунт, потом лаунчер, потом вход на сервер.
        </p>
      </div>

      <div class="mt-10 grid gap-6 lg:grid-cols-2">
        <div class="glass-card rounded-[32px] p-8">
          <div class="mb-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-500">
            Твой статус
          </div>
          <h2 class="text-2xl font-black text-slate-900">
            {{ isAuthenticated ? 'Можно скачивать' : 'Сначала войди или зарегистрируйся' }}
          </h2>
          <p class="mt-4 leading-7 text-slate-600">
            <template v-if="isAuthenticated">
              Ты вошёл как <strong>{{ auth.displayName.value }}</strong>. Теперь скачай лаунчер и используй этот же аккаунт для входа в игру.
            </template>
            <template v-else>
              Сначала создай аккаунт или войди в уже существующий. После этого можно будет скачать официальный лаунчер.
            </template>
          </p>

          <div
            v-if="isAuthenticated && !auth.emailVerified.value"
            class="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            Почта пока не подтверждена. Играть это сейчас не мешает, но лучше подтвердить её заранее.
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
            <RouterLink v-if="!isAuthenticated" to="/login" class="btn btn-outline rounded-2xl">Уже есть аккаунт</RouterLink>
            <RouterLink v-if="isAuthenticated" to="/profile" class="btn btn-outline rounded-2xl">Мой профиль</RouterLink>
            <RouterLink v-if="isAuthenticated && !auth.emailVerified.value" to="/verify-email" class="btn btn-ghost rounded-2xl">Подтвердить почту</RouterLink>
          </div>
        </div>

        <div class="glass-card rounded-[32px] p-8">
          <div class="mb-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-500">
            Что делать дальше
          </div>
          <h2 class="text-2xl font-black text-slate-900">Три простых шага</h2>
          <div class="mt-6 grid gap-4">
            <div class="build-info-card">
              <p class="build-info-card__label">1. Аккаунт</p>
              <p class="build-info-card__value">Зарегистрируйся или войди на сайте</p>
            </div>
            <div class="build-info-card">
              <p class="build-info-card__label">2. Лаунчер</p>
              <p class="build-info-card__value">Скачай лаунчер и войди под теми же данными</p>
            </div>
            <div class="build-info-card">
              <p class="build-info-card__label">3. Игра</p>
              <p class="build-info-card__value">Запусти клиент и заходи на сервер</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
