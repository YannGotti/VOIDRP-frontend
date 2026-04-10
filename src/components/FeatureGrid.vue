<script setup>
import { siteConfig } from '../config.site'
</script>

<template>
  <section class="py-6 md:py-10">
    <div class="container-shell">
      <div class="mb-8 max-w-3xl">
        <div class="section-kicker">Собрано на одной площадке</div>
        <h2 class="section-title">Нужные вещи рядом, без захламления интерфейса</h2>
        <p class="section-subtitle">
          Никаких лишних панелей. Только регистрация, скачивание, профиль, карта мира и понятные переходы между ними.
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="feature in siteConfig.features"
          :key="feature.title"
          class="surface-card p-5"
        >
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl shadow-sm">
            {{ feature.icon }}
          </div>
          <h3 class="mt-4 text-xl font-black tracking-tight text-slate-950">{{ feature.title }}</h3>
          <p class="mt-3 text-sm leading-7 text-slate-600">{{ feature.description }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
