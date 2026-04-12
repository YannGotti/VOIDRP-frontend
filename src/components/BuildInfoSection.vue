<script setup>
import { siteConfig } from '../config.site'
</script>

<template>
  <section class="py-4 md:py-6">
    <div class="container-shell grid gap-4 lg:grid-cols-[0.94fr_1.06fr]">
      <article class="surface-card p-5 md:p-6">
        <div class="section-kicker !mb-2">О сервере</div>
        <h2 class="text-2xl font-black tracking-tight text-slate-50 md:text-3xl">
          Что игрок увидит с первых минут
        </h2>
        <p class="mt-3 text-sm leading-7 text-slate-400 md:text-[15px]">
          Сайт для входа, официальный лаунчер, карта мира и публичный профиль остаются
          в центре, но поданы компактнее и чище.
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
          Интерфейс выглядит цельно и не перегружает игрока
        </h3>

        <div class="mt-5 grid gap-2.5">
          <div class="dark-list-card">
            <p class="text-sm font-black text-white">01 — Один аккаунт</p>
            <p class="mt-1.5 text-sm leading-6 text-white/74">
              Сайт, профиль и лаунчер работают через одну точку входа.
            </p>
          </div>

          <div class="dark-list-card">
            <p class="text-sm font-black text-white">02 — Понятный кабинет</p>
            <p class="mt-1.5 text-sm leading-6 text-white/74">
              Только полезные данные и кнопки без служебного шума.
            </p>
          </div>

          <div class="dark-list-card">
            <p class="text-sm font-black text-white">03 — Живой публичный профиль</p>
            <p class="mt-1.5 text-sm leading-6 text-white/74">
              Баннер, фон, аватар и статус действительно меняют вид страницы.
            </p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
