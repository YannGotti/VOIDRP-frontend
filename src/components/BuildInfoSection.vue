<script setup>
import { siteConfig } from '../config.site'
</script>

<template>
  <section class="py-3 md:py-4">
    <div class="container-shell grid gap-3 lg:grid-cols-[0.94fr_1.06fr]">
      <article class="surface-card p-4 md:p-5">
        <div class="section-kicker !mb-2">О сервере</div>
        <h2 class="text-xl font-black tracking-tight text-slate-50 md:text-2xl">
          Что важно с первых минут
        </h2>
        <p class="mt-2 text-sm leading-6 text-slate-400 md:text-[14px]">
          Без служебного шума: версия, путь к лаунчеру, карта мира и понятный старт.
        </p>

        <div class="mt-4 grid gap-2.5 sm:grid-cols-2">
          <div class="metric-card">
            <div class="metric-label">Сборка</div>
            <div class="metric-value !text-[1.05rem]">Better MC 5</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Версия</div>
            <div class="metric-value !text-[1.05rem]">{{ siteConfig.serverVersion }}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Адрес</div>
            <div class="metric-value !text-[1.05rem]">{{ siteConfig.serverIp }}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Карта</div>
            <div class="metric-value !text-[1.05rem]">В браузере</div>
          </div>
        </div>
      </article>

      <article class="gradient-panel p-4 md:p-5">
        <div class="section-kicker section-kicker--light !mb-2">Почему это проще</div>
        <h3 class="text-xl font-black tracking-tight text-white md:text-[1.7rem]">
          Интерфейс не мешает игроку
        </h3>

        <div class="mt-4 grid gap-2">
          <div class="dark-list-card">
            <p class="text-sm font-black text-white">01 — Один вход</p>
            <p class="mt-1 text-sm leading-6 text-white/74">
              Один аккаунт и для сайта, и для лаунчера.
            </p>
          </div>

          <div class="dark-list-card">
            <p class="text-sm font-black text-white">02 — Живые страницы</p>
            <p class="mt-1 text-sm leading-6 text-white/74">
              Профиль игрока и государства выглядят аккуратно, а не как техпанель.
            </p>
          </div>

          <div class="dark-list-card">
            <p class="text-sm font-black text-white">03 — Быстрые переходы</p>
            <p class="mt-1 text-sm leading-6 text-white/74">
              Лаунчер, карта и Discord в одном-двух кликах почти везде.
            </p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
