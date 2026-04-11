<script setup>
import { siteConfig } from '../config.site'
</script>

<template>
  <section class="relative overflow-hidden py-14 md:py-18 xl:py-22">
    <div class="container-shell grid items-center gap-8 xl:grid-cols-[1.06fr_0.94fr] xl:gap-10">
      <div class="relative z-10 pb-2">
        <div class="section-kicker">{{ siteConfig.hero.badge }}</div>

        <h1 class="max-w-5xl text-[3rem] font-black leading-[1.06] tracking-[-0.05em] text-slate-50 md:text-[4.35rem] xl:text-[5.05rem]">
          Регистрация и вход в игру
          <span class="text-gradient mt-3 block pb-[0.18em]">на сайте и в лаунчере</span>
        </h1>

        <p class="section-subtitle mt-6 max-w-2xl text-[1.02rem] leading-8 md:text-[1.08rem]">
          {{ siteConfig.hero.description }} Теперь вся оболочка сделана в dark style: чище, глубже и без ощущения перегруженной светлой панели.
        </p>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <RouterLink to="/register" class="btn btn-primary">
            Создать аккаунт
          </RouterLink>
          <RouterLink to="/download-launcher" class="btn btn-outline">
            Скачать лаунчер
          </RouterLink>
        </div>

        <div class="mt-8 flex flex-wrap gap-3 pb-2">
          <div class="hero-chip">Адрес: {{ siteConfig.serverIp }}</div>
          <div class="hero-chip">Версия: {{ siteConfig.serverVersion }}</div>
          <div class="hero-chip">Сборка: Better MC 5</div>
        </div>
      </div>

      <div class="gradient-panel p-5 md:p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.22em] text-white/55">Путь игрока</p>
            <h2 class="mt-2 text-3xl font-black tracking-tight text-white md:text-[2.15rem]">Три понятных шага</h2>
          </div>

          <div class="inline-chip border-white/10 bg-white/8 text-white/82">
            Dark UI
          </div>
        </div>

        <div class="mt-6 grid gap-3 sm:grid-cols-3">
          <div class="hero-step-card">
            <p class="hero-step-label">Шаг 1</p>
            <p class="hero-step-title">Аккаунт</p>
            <p class="hero-step-text">Создай аккаунт и укажи игровой ник один раз.</p>
          </div>
          <div class="hero-step-card">
            <p class="hero-step-label">Шаг 2</p>
            <p class="hero-step-title">Лаунчер</p>
            <p class="hero-step-text">Скачай официальный лаунчер и войди тем же аккаунтом.</p>
          </div>
          <div class="hero-step-card">
            <p class="hero-step-label">Шаг 3</p>
            <p class="hero-step-title">Игра</p>
            <p class="hero-step-text">Нажми «Играть», остальное лаунчер сделает сам.</p>
          </div>
        </div>

        <div class="mt-6 rounded-[1.6rem] border border-white/10 bg-white/7 p-4 md:p-5">
          <p class="text-sm font-semibold text-white/58">Почему это удобно</p>
          <div class="mt-3 grid gap-3">
            <div class="hero-reason-card">
              <span class="hero-reason-dot bg-sky-300"></span>
              Не нужно вручную искать нужную сборку и настраивать клиент.
            </div>
            <div class="hero-reason-card">
              <span class="hero-reason-dot bg-emerald-300"></span>
              Все важные действия находятся в одном кабинете без лишнего мусора.
            </div>
            <div class="hero-reason-card">
              <span class="hero-reason-dot bg-violet-300"></span>
              Публичный профиль теперь живёт на фоне всей страницы, а не в отдельной светлой коробке.
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
