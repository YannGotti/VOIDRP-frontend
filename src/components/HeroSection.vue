<script setup>
import { siteConfig } from '../config.site'
</script>

<template>
  <section class="relative overflow-hidden py-14 md:py-20 xl:py-24">
    <div class="container-shell grid items-center gap-6 lg:grid-cols-[1.06fr_0.94fr] lg:gap-10">
      <div class="relative z-10">
        <div class="section-kicker">{{ siteConfig.hero.badge }}</div>

        <h1 class="max-w-5xl text-4xl font-black leading-[0.96] tracking-[-0.05em] text-slate-950 md:text-6xl xl:text-7xl">
          Сайт и старт в игру
          <span class="text-gradient mt-2 block">без лишней возни и перегруза</span>
        </h1>

        <p class="section-subtitle mt-6 max-w-2xl">
          {{ siteConfig.hero.description }} Всё сделано так, чтобы игрок видел только нужные шаги: аккаунт, лаунчер, вход в игру и полезные ссылки.
        </p>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <RouterLink to="/register" class="btn btn-primary">
            Создать аккаунт
          </RouterLink>
          <RouterLink to="/download-launcher" class="btn btn-outline">
            Скачать лаунчер
          </RouterLink>
        </div>

        <div class="mt-8 flex flex-wrap gap-3">
          <div class="hero-chip">Адрес: {{ siteConfig.serverIp }}</div>
          <div class="hero-chip">Версия: {{ siteConfig.serverVersion }}</div>
          <div class="hero-chip">Сборка: Better MC 5</div>
        </div>
      </div>

      <div class="gradient-panel p-5 md:p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.22em] text-white/60">Путь игрока</p>
            <h2 class="mt-2 text-3xl font-black tracking-tight text-white md:text-[2.15rem]">Три понятных шага</h2>
          </div>

          <div class="inline-chip border-white/12 bg-white/10 text-white">
            Player-first UI
          </div>
        </div>

        <div class="mt-6 grid gap-3 sm:grid-cols-3">
          <div class="rounded-[1.4rem] border border-white/10 bg-white/8 p-4">
            <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">Шаг 1</p>
            <p class="mt-2 text-lg font-black text-white">Аккаунт</p>
            <p class="mt-2 text-sm leading-6 text-white/72">Создай аккаунт и укажи игровой ник один раз.</p>
          </div>
          <div class="rounded-[1.4rem] border border-white/10 bg-white/8 p-4">
            <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">Шаг 2</p>
            <p class="mt-2 text-lg font-black text-white">Лаунчер</p>
            <p class="mt-2 text-sm leading-6 text-white/72">Скачай официальный лаунчер и войди тем же аккаунтом.</p>
          </div>
          <div class="rounded-[1.4rem] border border-white/10 bg-white/8 p-4">
            <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">Шаг 3</p>
            <p class="mt-2 text-lg font-black text-white">Игра</p>
            <p class="mt-2 text-sm leading-6 text-white/72">Нажми «Играть», остальное лаунчер сделает сам.</p>
          </div>
        </div>

        <div class="mt-6 rounded-[1.6rem] border border-white/10 bg-white/10 p-4 md:p-5">
          <p class="text-sm font-semibold text-white/60">Почему это удобно</p>
          <div class="mt-3 grid gap-3">
            <div class="flex items-start gap-3 rounded-[1.1rem] bg-black/10 px-4 py-3 text-sm leading-6 text-white/82">
              <span class="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-300"></span>
              Не нужно вручную искать нужную сборку и настраивать клиент.
            </div>
            <div class="flex items-start gap-3 rounded-[1.1rem] bg-black/10 px-4 py-3 text-sm leading-6 text-white/82">
              <span class="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-300"></span>
              Все важные действия находятся в одном кабинете без мусора и лишних блоков.
            </div>
            <div class="flex items-start gap-3 rounded-[1.1rem] bg-black/10 px-4 py-3 text-sm leading-6 text-white/82">
              <span class="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-violet-300"></span>
              Публичный профиль выглядит как игровая страница, а не как анкета.
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
