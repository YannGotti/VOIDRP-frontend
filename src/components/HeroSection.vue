<script setup>
import { siteConfig } from '../config.site'
</script>

<template>
  <section class="relative overflow-hidden py-10 md:py-14 xl:py-16">
    <div class="container-shell grid items-start gap-5 xl:grid-cols-[1.02fr_0.98fr] xl:gap-6">
      <div class="relative z-10 pb-1">
        <div class="section-kicker">{{ siteConfig.hero.badge }}</div>

        <h1 class="max-w-5xl text-[2.45rem] font-black leading-[0.98] tracking-[-0.06em] text-slate-50 md:text-[3.3rem] xl:text-[4.35rem]">
          {{ siteConfig.hero.title }}
          <span class="text-gradient mt-2 block pb-[0.12em]">через официальный сайт и лаунчер</span>
        </h1>

        <p class="section-subtitle mt-4 max-w-2xl text-[0.98rem] leading-7 md:text-[1rem]">
          {{ siteConfig.hero.description }}
        </p>

        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <RouterLink to="/register" class="btn btn-primary">
            Создать аккаунт
          </RouterLink>
          <RouterLink to="/download-launcher" class="btn btn-outline">
            Скачать лаунчер
          </RouterLink>
          <a :href="siteConfig.dynmapUrl" target="_blank" rel="noreferrer" class="btn btn-ghost">
            Открыть карту
          </a>
        </div>

        <div class="mt-6 flex flex-wrap gap-2.5 pb-1">
          <div class="hero-chip">Адрес: {{ siteConfig.serverIp }}</div>
          <div class="hero-chip">Версия: {{ siteConfig.serverVersion }}</div>
          <div class="hero-chip">Better MC 5</div>
          <div class="hero-chip">Официальный лаунчер</div>
        </div>
      </div>

      <div class="gradient-panel p-4 md:p-5">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">Путь игрока</p>
            <h2 class="mt-2 text-[1.8rem] font-black tracking-tight text-white md:text-[2rem]">
              Три шага до входа
            </h2>
          </div>

          <div class="inline-chip border-white/10 bg-white/8 text-white/82">
            Player-first UX
          </div>
        </div>

        <div class="mt-5 grid gap-2.5 sm:grid-cols-3">
          <div class="hero-step-card">
            <p class="hero-step-label">Шаг 1</p>
            <p class="hero-step-title">Аккаунт</p>
            <p class="hero-step-text">Регистрируешься на сайте и подтверждаешь почту один раз.</p>
          </div>

          <div class="hero-step-card">
            <p class="hero-step-label">Шаг 2</p>
            <p class="hero-step-title">Лаунчер</p>
            <p class="hero-step-text">Скачиваешь официальный клиент и входишь тем же аккаунтом.</p>
          </div>

          <div class="hero-step-card">
            <p class="hero-step-label">Шаг 3</p>
            <p class="hero-step-title">Игра</p>
            <p class="hero-step-text">Нажимаешь «Играть», а сайт и лаунчер берут всё остальное на себя.</p>
          </div>
        </div>

        <div class="mt-5 rounded-[1.35rem] border border-white/10 bg-white/6 p-3.5 md:p-4">
          <p class="text-[12px] font-semibold text-white/58">Что получает обычный игрок</p>

          <div class="mt-3 grid gap-2">
            <div class="hero-reason-card">
              <span class="hero-reason-dot bg-sky-300"></span>
              Не нужно искать модпак, версию клиента и отдельные инструкции.
            </div>

            <div class="hero-reason-card">
              <span class="hero-reason-dot bg-emerald-300"></span>
              Кабинет, профиль и переход к игре собраны в одном понятном месте.
            </div>

            <div class="hero-reason-card">
              <span class="hero-reason-dot bg-violet-300"></span>
              Государства, рейтинг и карта мира доступны без перегруза интерфейса.
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
