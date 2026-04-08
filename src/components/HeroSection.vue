<script setup>
import { siteConfig } from '../config.site'
</script>

<template>
  <section class="relative overflow-hidden py-16 md:py-24 xl:py-28">
    <div class="container-shell grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
      <div class="relative z-10">
        <div
          class="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
        >
          <span class="h-2 w-2 rounded-full bg-primary"></span>
          {{ siteConfig.hero.badge }}
        </div>

        <h1 class="max-w-5xl text-4xl font-black leading-[1.05] md:text-6xl xl:text-7xl">
          {{ siteConfig.serverName }}
          <span class="text-gradient mt-2 block">{{ siteConfig.hero.title }}</span>
        </h1>

        <p class="mt-6 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
          {{ siteConfig.hero.description }}
        </p>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <RouterLink
            to="/download-launcher"
            class="btn btn-primary btn-lg rounded-2xl shadow-[0_12px_45px_rgba(56,189,248,0.20)]"
          >
            Перейти к скачиванию
          </RouterLink>
          <RouterLink
            to="/register"
            class="btn btn-outline btn-lg rounded-2xl"
          >
            Создать аккаунт
          </RouterLink>
        </div>

        <div class="mt-8 flex flex-wrap gap-3">
          <div class="hero-chip">IP: {{ siteConfig.serverIp }}</div>
          <div class="hero-chip">Версия: {{ siteConfig.serverVersion }}</div>
          <div class="hero-chip">Сборка: Better MC 5</div>
        </div>
      </div>

      <div class="relative">
        <div class="glass-card rounded-[32px] p-5 md:p-6">
          <div class="hero-preview">
            <div class="hero-preview__top">
              <div>
                <p class="text-sm uppercase tracking-[0.22em] text-slate-500">VoidRP</p>
                <p class="mt-2 text-3xl font-black text-slate-900">Сайт, аккаунт и лаунчер в одной системе</p>
              </div>

              <div
                class="rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700"
              >
                Better MC 5
              </div>
            </div>

            <div class="mt-6 grid gap-4 sm:grid-cols-3">
              <div class="hero-stat">
                <p class="hero-stat__label">Шаг 1</p>
                <p class="hero-stat__value" style="font-size: 16px;">Регистрация</p>
              </div>
              <div class="hero-stat">
                <p class="hero-stat__label">Шаг 2</p>
                <p class="hero-stat__value" style="font-size: 16px;">Лаунчер</p>
              </div>
              <div class="hero-stat">
                <p class="hero-stat__label">Шаг 3</p>
                <p class="hero-stat__value" style="font-size: 16px;">Игра</p>
              </div>
            </div>

            <div class="mt-6 grid gap-3">
              <div class="info-row">
                <span class="info-dot info-dot--blue"></span>
                Сначала создай аккаунт VoidRP и подтверди почту.
              </div>
              <div class="info-row">
                <span class="info-dot info-dot--emerald"></span>
                Потом скачай официальный лаунчер и используй тот же аккаунт.
              </div>
              <div class="info-row">
                <span class="info-dot info-dot--violet"></span>
                Дальше профиль, скин, статистика и игровой вход будут жить в одной системе.
              </div>
            </div>

            <div class="mt-6 rounded-[24px] border border-slate-200 bg-white/80 p-4">
              <p class="text-sm text-slate-500">Новый старт</p>
              <p class="mt-2 text-base leading-7 text-slate-700">
                Теперь сайт ведёт игрока не сразу к файлу, а в понятную воронку: аккаунт → скачивание → лаунчер.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
