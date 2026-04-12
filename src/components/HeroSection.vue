<script setup>
import { siteConfig } from '../config.site'
</script>

<template>
  <section class="relative overflow-hidden py-10 md:py-14 xl:py-16">
    <div class="container-shell grid items-start gap-5 xl:grid-cols-[1.02fr_0.98fr] xl:gap-6">
      <div class="relative z-10 pb-1">
        <div class="section-kicker">{{ siteConfig.hero.badge }}</div>

        <h1 class="max-w-4xl text-[2.35rem] font-black leading-[1.02] tracking-[-0.05em] text-slate-50 md:text-[3.2rem] xl:text-[3.9rem]">
          Регистрация и вход
          <span class="text-gradient mt-2 block pb-[0.12em]">на сайте и в лаунчере</span>
        </h1>

        <p class="section-subtitle mt-4 max-w-2xl text-[0.96rem] leading-7 md:text-[1rem]">
          {{ siteConfig.hero.description }} Всё сделано компактнее, чище и понятнее для игрока.
        </p>

        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <RouterLink to="/register" class="btn btn-primary">
            Создать аккаунт
          </RouterLink>
          <RouterLink to="/download-launcher" class="btn btn-outline">
            Скачать лаунчер
          </RouterLink>
        </div>

        <div class="mt-6 flex flex-wrap gap-2.5 pb-1">
          <div class="hero-chip">Адрес: {{ siteConfig.serverIp }}</div>
          <div class="hero-chip">Версия: {{ siteConfig.serverVersion }}</div>
          <div class="hero-chip">Better MC 5</div>
        </div>
      </div>

      <div class="gradient-panel p-4 md:p-5">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">Путь игрока</p>
            <h2 class="mt-2 text-[1.8rem] font-black tracking-tight text-white md:text-[2rem]">
              Три понятных шага
            </h2>
          </div>

          <div class="inline-chip border-white/10 bg-white/8 text-white/82">
            Dark UI
          </div>
        </div>

        <div class="mt-5 grid gap-2.5 sm:grid-cols-3">
          <div class="hero-step-card">
            <p class="hero-step-label">Шаг 1</p>
            <p class="hero-step-title">Аккаунт</p>
            <p class="hero-step-text">Создай аккаунт и укажи игровой ник один раз.</p>
          </div>

          <div class="hero-step-card">
            <p class="hero-step-label">Шаг 2</p>
            <p class="hero-step-title">Лаунчер</p>
            <p class="hero-step-text">Скачай лаунчер и войди тем же аккаунтом.</p>
          </div>

          <div class="hero-step-card">
            <p class="hero-step-label">Шаг 3</p>
            <p class="hero-step-title">Игра</p>
            <p class="hero-step-text">Нажми «Играть», остальное лаунчер сделает сам.</p>
          </div>
        </div>

        <div class="mt-5 rounded-[1.35rem] border border-white/10 bg-white/6 p-3.5 md:p-4">
          <p class="text-[12px] font-semibold text-white/58">Почему это удобно</p>

          <div class="mt-3 grid gap-2">
            <div class="hero-reason-card">
              <span class="hero-reason-dot bg-sky-300"></span>
              Не нужно вручную искать сборку и настраивать клиент.
            </div>

            <div class="hero-reason-card">
              <span class="hero-reason-dot bg-emerald-300"></span>
              Все важные действия находятся в одном кабинете.
            </div>

            <div class="hero-reason-card">
              <span class="hero-reason-dot bg-violet-300"></span>
              Публичный профиль теперь выглядит как часть сайта, а не отдельная коробка.
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
