<script setup>
import { siteConfig } from '../config.site'
</script>

<template>
  <section class="py-4 md:py-6">
    <div class="container-shell grid gap-4 lg:grid-cols-[0.94fr_1.06fr]">
      <article class="surface-card p-5 md:p-6">
        <div class="section-kicker !mb-2">О сервере</div>
        <h2 class="text-2xl font-black tracking-tight text-slate-50 md:text-3xl">
          Что игрок видит с первых минут
        </h2>
        <p class="mt-3 text-sm leading-7 text-slate-400 md:text-[15px]">
          Тут нет служебного шума. Игроку сразу понятны версия, путь к лаунчеру, карта мира
          и общая логика входа.
        </p>

        <div class="mt-5 grid gap-3 sm:grid-cols-2">
          <div class="metric-card">
            <div class="metric-label">Сборка</div>
            <div class="metric-value !text-[1.18rem]">Better MC 5</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Версия</div>
            <div class="metric-value !text-[1.18rem]">{{ siteConfig.serverVersion }}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Адрес</div>
            <div class="metric-value !text-[1.18rem]">{{ siteConfig.serverIp }}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Карта</div>
            <div class="metric-value !text-[1.18rem]">В браузере</div>
          </div>
        </div>
      </article>

      <article class="gradient-panel p-5 md:p-6">
        <div class="section-kicker section-kicker--light !mb-2">Почему это проще</div>
        <h3 class="text-2xl font-black tracking-tight text-white md:text-[2rem]">
          Интерфейс не спорит с игроком и не прячет важные действия
        </h3>

        <div class="mt-5 grid gap-2.5">
          <div class="dark-list-card">
            <p class="text-sm font-black text-white">01 — Один понятный вход</p>
            <p class="mt-1.5 text-sm leading-6 text-white/74">
              Один аккаунт работает и на сайте, и в лаунчере без дублирующих форм.
            </p>
          </div>

          <div class="dark-list-card">
            <p class="text-sm font-black text-white">02 — Красивые публичные страницы</p>
            <p class="mt-1.5 text-sm leading-6 text-white/74">
              Профиль игрока и государства выглядят как полноценные живые страницы, а не как админка.
            </p>
          </div>

          <div class="dark-list-card">
            <p class="text-sm font-black text-white">03 — Быстрые переходы к игре</p>
            <p class="mt-1.5 text-sm leading-6 text-white/74">
              Лаунчер, карта и кабинет находятся на расстоянии одного клика почти на всех экранах.
            </p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
