<script setup>
import { siteConfig } from '../config.site'
</script>

<template>
  <section class="py-12 md:py-16">
    <div class="container-shell space-y-6">
      <div class="gradient-panel p-6 md:p-8 lg:p-10">
        <div class="section-kicker section-kicker--light">Официальный способ входа</div>
        <h1 class="text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
          Лаунчер {{ siteConfig.serverName }} — главный и самый удобный путь в игру
        </h1>
        <p class="mt-4 max-w-3xl text-base leading-8 text-white/78">
          Сначала войди или зарегистрируйся на сайте, затем скачай официальный лаунчер и используй тот же аккаунт для запуска игры. Интерфейс и поток сделаны так, чтобы игрок не путался в шагах.
        </p>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <RouterLink to="/download-launcher" class="btn btn-primary bg-white !text-slate-950 shadow-none">
            Скачать лаунчер
          </RouterLink>
          <a :href="siteConfig.dynmapUrl" target="_blank" rel="noreferrer" class="btn btn-light">
            Открыть карту
          </a>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <article class="surface-card p-5 md:p-6">
          <div class="metric-label">Шаг 1</div>
          <h2 class="mt-3 text-2xl font-black tracking-tight text-slate-950">Аккаунт</h2>
          <p class="mt-3 text-sm leading-7 text-slate-600">
            Создай аккаунт на сайте, укажи игровой ник и при желании сразу оформи красивый публичный профиль.
          </p>
        </article>

        <article class="surface-card p-5 md:p-6">
          <div class="metric-label">Шаг 2</div>
          <h2 class="mt-3 text-2xl font-black tracking-tight text-slate-950">Скачивание</h2>
          <p class="mt-3 text-sm leading-7 text-slate-600">
            Скачай официальный лаунчер. Он сам подтянет нужную сборку и не заставит игрока вручную разбираться в модпаке.
          </p>
        </article>

        <article class="surface-card p-5 md:p-6">
          <div class="metric-label">Шаг 3</div>
          <h2 class="mt-3 text-2xl font-black tracking-tight text-slate-950">Играть</h2>
          <p class="mt-3 text-sm leading-7 text-slate-600">
            Войди в лаунчер тем же аккаунтом и нажми «Играть». Сайт и лаунчер работают как одна аккуратная система.
          </p>
        </article>
      </div>
    </div>
  </section>
</template>
