<script setup>
import { siteConfig } from '../config.site'
</script>

<template>
  <section class="py-12 md:py-16">
    <div class="container-shell space-y-6">
      <div class="gradient-panel p-6 md:p-8 lg:p-10">
        <div class="section-kicker section-kicker--light">Лаунчер</div>
        <h1 class="text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
          Самый простой путь в игру
        </h1>
        <p class="mt-4 max-w-3xl text-base leading-8 text-white/78">
          Войди на сайте, скачай официальный лаунчер и запускай игру тем же аккаунтом. Без ручной настройки, лишних файлов и непонятных шагов.
        </p>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <RouterLink to="/download-launcher" class="btn btn-primary">
            Скачать лаунчер
          </RouterLink>
          <a :href="siteConfig.dynmapUrl" target="_blank" rel="noreferrer" class="btn btn-outline">
            Открыть карту
          </a>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <article class="surface-card p-5 md:p-6">
          <div class="metric-label">1</div>
          <h2 class="mt-3 text-xl font-black tracking-tight text-slate-50">Создай аккаунт</h2>
          <p class="mt-3 text-sm leading-7 text-slate-300">
            Зарегистрируйся один раз и используй этот аккаунт и на сайте, и в лаунчере.
          </p>
        </article>

        <article class="surface-card p-5 md:p-6">
          <div class="metric-label">2</div>
          <h2 class="mt-3 text-xl font-black tracking-tight text-slate-50">Скачай лаунчер</h2>
          <p class="mt-3 text-sm leading-7 text-slate-300">
            Лаунчер сам подготовит нужную сборку и не заставит разбираться в модах вручную.
          </p>
        </article>

        <article class="surface-card p-5 md:p-6">
          <div class="metric-label">3</div>
          <h2 class="mt-3 text-xl font-black tracking-tight text-slate-50">Нажми «Играть»</h2>
          <p class="mt-3 text-sm leading-7 text-slate-300">
            Входишь под тем же аккаунтом и сразу переходишь к игре.
          </p>
        </article>
      </div>
    </div>
  </section>
</template>
