<script setup>
import { siteConfig } from '../config.site'
</script>

<template>
  <section class="py-6 md:py-10">
    <div class="container-shell grid gap-6 lg:grid-cols-[0.94fr_1.06fr]">
      <article class="surface-card p-6 md:p-7">
        <div class="section-kicker">О сервере</div>
        <h2 class="section-title">Что игрок увидит с первых минут</h2>
        <p class="section-subtitle">
          Тёмная тема не меняет логику: сайт для входа, официальный лаунчер, карта мира и красивый публичный профиль всё так же остаются в центре.
        </p>

        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <div class="metric-card">
            <div class="metric-label">Сборка</div>
            <div class="metric-value !text-[1.45rem]">Better MC 5</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Версия</div>
            <div class="metric-value !text-[1.45rem]">{{ siteConfig.serverVersion }}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Адрес</div>
            <div class="metric-value !text-[1.45rem]">{{ siteConfig.serverIp }}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Карта</div>
            <div class="metric-value !text-[1.45rem]">В браузере</div>
          </div>
        </div>
      </article>

      <article class="gradient-panel p-6 md:p-7">
        <div class="section-kicker section-kicker--light">Почему это проще</div>
        <h3 class="text-3xl font-black tracking-tight text-white md:text-[2.35rem]">
          Интерфейс теперь выглядит цельно и не выбивается в светлые блоки
        </h3>

        <div class="mt-6 grid gap-3">
          <div class="dark-list-card">
            <p class="text-sm font-black text-white">01 — Один аккаунт</p>
            <p class="mt-2 text-sm leading-7 text-white/74">Сайт, профиль и лаунчер работают через одну точку входа.</p>
          </div>
          <div class="dark-list-card">
            <p class="text-sm font-black text-white">02 — Нормальный кабинет</p>
            <p class="mt-2 text-sm leading-7 text-white/74">Без служебного шума. Только нужные данные и полезные кнопки.</p>
          </div>
          <div class="dark-list-card">
            <p class="text-sm font-black text-white">03 — Живой публичный профиль</p>
            <p class="mt-2 text-sm leading-7 text-white/74">Баннер, фон, аватар и статус теперь действительно меняют вид страницы.</p>
          </div>
          <div class="dark-list-card">
            <p class="text-sm font-black text-white">04 — Всё рядом</p>
            <p class="mt-2 text-sm leading-7 text-white/74">Карта мира, новости и скачивание доступны без лишнего поиска по меню.</p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
