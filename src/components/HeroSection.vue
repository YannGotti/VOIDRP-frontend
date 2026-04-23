<script setup>
import { siteConfig } from '../config.site'
</script>

<template>
  <section class="relative overflow-hidden py-6 md:py-8 xl:py-10">
    <div class="container-shell grid items-start gap-4 xl:grid-cols-[1fr_0.96fr] xl:gap-5">
      <div class="relative z-10 pb-1">
        <div class="section-kicker">{{ siteConfig.hero.badge }}</div>

        <h1 class="max-w-5xl text-[2.05rem] font-black leading-[0.97] tracking-[-0.055em] text-slate-50 md:text-[2.7rem] xl:text-[3.5rem]">
          {{ siteConfig.hero.title }}
          <span class="text-gradient mt-1.5 block pb-[0.08em]">через официальный сайт и лаунчер</span>
        </h1>

        <p class="section-subtitle mt-3 max-w-2xl text-[0.95rem] leading-6 md:text-[0.98rem]">
          {{ siteConfig.hero.description }}
        </p>

        <div class="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
          <RouterLink to="/register" class="btn btn-primary">Создать аккаунт</RouterLink>
          <RouterLink to="/download-launcher" class="btn btn-outline">Скачать лаунчер</RouterLink>
          <a :href="siteConfig.discordUrl" target="_blank" rel="noreferrer" class="btn btn-ghost">Discord</a>
        </div>

        <div class="mt-4 flex flex-wrap gap-2 pb-1">
          <div class="hero-chip">Адрес: {{ siteConfig.serverIp }}</div>
          <div class="hero-chip">Версия: {{ siteConfig.serverVersion }}</div>
          <div class="hero-chip">Better MC 5</div>
        </div>
      </div>

      <div class="gradient-panel p-4 md:p-4.5">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">Путь игрока</p>
            <h2 class="mt-1.5 text-[1.45rem] font-black tracking-tight text-white md:text-[1.7rem]">
              Три шага до входа
            </h2>
          </div>

          <div class="inline-chip border-white/10 bg-white/8 text-white/82">
            Коротко и ясно
          </div>
        </div>

        <div class="mt-4 grid gap-2 sm:grid-cols-3">
          <div class="hero-step-card">
            <p class="hero-step-label">Шаг 1</p>
            <p class="hero-step-title">Аккаунт</p>
            <p class="hero-step-text">Регистрируешься и подтверждаешь почту.</p>
          </div>

          <div class="hero-step-card">
            <p class="hero-step-label">Шаг 2</p>
            <p class="hero-step-title">Лаунчер</p>
            <p class="hero-step-text">Скачиваешь лаунчер и входишь под тем же аккаунтом.</p>
          </div>

          <div class="hero-step-card">
            <p class="hero-step-label">Шаг 3</p>
            <p class="hero-step-title">Игра</p>
            <p class="hero-step-text">Нажимаешь «Играть» и заходишь без ручной настройки.</p>
          </div>
        </div>

        <div class="mt-4 rounded-[1.15rem] border border-white/10 bg-white/6 p-3 md:p-3.5">
          <p class="text-[12px] font-semibold text-white/58">Почему это удобно</p>

          <div class="mt-2.5 grid gap-2">
            <div class="hero-reason-card">
              <span class="hero-reason-dot bg-sky-300"></span>
              Не нужно искать модпак и инструкции по углам.
            </div>
            <div class="hero-reason-card">
              <span class="hero-reason-dot bg-emerald-300"></span>
              Кабинет, карта, Discord и профиль в одном месте.
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
