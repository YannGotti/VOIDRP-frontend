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
        <div class="section-kicker">Скачивание лаунчера</div>
        <h1 class="section-title">Официальный лаунчер VoidRP</h1>
        <p class="section-subtitle">
          Эта страница стала основной точкой скачивания и ведёт игрока через новую account-входную воронку.
        </p>
      </div>

      <div class="mt-10 grid gap-6 lg:grid-cols-2">
        <div class="glass-card rounded-[32px] p-8">
          <div class="mb-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-500">
            Статус доступа
          </div>
          <h2 class="text-2xl font-black text-slate-900">
            {{ isAuthenticated ? 'Аккаунт найден' : 'Сначала нужен аккаунт' }}
          </h2>
          <p class="mt-4 leading-7 text-slate-600">
            <template v-if="isAuthenticated">
              Ты вошёл как <strong>{{ auth.displayName.value }}</strong>. Теперь можно скачать лаунчер и использовать этот же аккаунт в следующем этапе интеграции лаунчера.
            </template>
            <template v-else>
              Сначала зарегистрируй аккаунт или войди в уже существующий. После этого эта страница станет точкой скачивания официального лаунчера.
            </template>
          </p>

          <div
            v-if="isAuthenticated && !auth.emailVerified.value"
            class="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            Почта пока не подтверждена. На текущем этапе это ещё не блокирует скачивание, но лучше подтвердить email заранее.
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
            <RouterLink v-else to="/register" class="btn btn-primary rounded-2xl">Регистрация</RouterLink>
            <RouterLink v-if="!isAuthenticated" to="/login" class="btn btn-outline rounded-2xl">Уже зарегистрирован</RouterLink>
            <RouterLink v-if="isAuthenticated" to="/profile" class="btn btn-outline rounded-2xl">Открыть профиль</RouterLink>
            <RouterLink v-if="isAuthenticated && !auth.emailVerified.value" to="/verify-email" class="btn btn-ghost rounded-2xl">Подтвердить email</RouterLink>
          </div>
        </div>

        <div class="glass-card rounded-[32px] p-8">
          <div class="mb-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-500">
            Что дальше
          </div>
          <h2 class="text-2xl font-black text-slate-900">Новая цепочка запуска</h2>
          <div class="mt-6 grid gap-4">
            <div class="build-info-card">
              <p class="build-info-card__label">1. Сайт</p>
              <p class="build-info-card__value">Регистрация, вход, подтверждение почты</p>
            </div>
            <div class="build-info-card">
              <p class="build-info-card__label">2. Лаунчер</p>
              <p class="build-info-card__value">Вход тем же аккаунтом и подготовка клиента</p>
            </div>
            <div class="build-info-card">
              <p class="build-info-card__label">3. Игра</p>
              <p class="build-info-card__value">Дальше будет подключён единый игровой вход</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
