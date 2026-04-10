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
            Это основной способ входа на сервер. Лаунчер сам подготовит игру и запустит нужную сборку.
          </p>

          <div class="mt-6 rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
            <div class="metric-label">Сейчас</div>
            <div class="mt-3 text-2xl font-black tracking-tight text-slate-50">
              {{ isAuthenticated ? 'Всё готово для скачивания' : 'Сначала нужен вход в аккаунт' }}
            </div>
            <p class="mt-3 text-sm leading-7 text-slate-300">
              <template v-if="isAuthenticated">
                Ты вошёл как <strong>{{ auth.displayName.value }}</strong>. Можешь скачать лаунчер и запускать игру этим же аккаунтом.
              </template>
              <template v-else>
                Зарегистрируйся или войди в существующий аккаунт. После этого скачивание и вход в игру станут доступными.
              </template>
            </p>

            <div v-if="isAuthenticated && !auth.emailVerified.value" class="alert alert-warn mt-4">
              Почта ещё не подтверждена. Лучше завершить этот шаг заранее.
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
            <RouterLink v-if="isAuthenticated && !auth.emailVerified.value" to="/verify-email" class="btn btn-outline">
              Подтвердить почту
            </RouterLink>
          </div>
        </div>

        <div class="surface-card p-6 md:p-8 lg:p-10">
          <div class="section-kicker">Что дальше</div>
          <h2 class="text-3xl font-black tracking-tight text-slate-50 md:text-4xl">Три простых шага</h2>

          <div class="mt-6 grid gap-3">
            <div class="action-card">
              <p class="text-sm font-black text-slate-50">1. Войти на сайте</p>
              <p class="mt-2 text-sm leading-7 text-slate-300">Используй свой аккаунт VoidRP.</p>
            </div>
            <div class="action-card">
              <p class="text-sm font-black text-slate-50">2. Скачать лаунчер</p>
              <p class="mt-2 text-sm leading-7 text-slate-300">Получишь актуальную и уже настроенную сборку.</p>
            </div>
            <div class="action-card">
              <p class="text-sm font-black text-slate-50">3. Нажать «Играть»</p>
              <p class="mt-2 text-sm leading-7 text-slate-300">Лаунчер всё проверит и запустит игру.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
