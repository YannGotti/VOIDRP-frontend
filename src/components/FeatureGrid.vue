<script setup>
import { siteConfig } from '../config.site'
</script>

<template>
  <section class="py-4 md:py-6">
    <div class="container-shell">
      <div class="mb-6 max-w-3xl">
        <div class="section-kicker !mb-2">Собрано на одной площадке</div>
        <h2 class="text-2xl font-black tracking-tight text-slate-50 md:text-3xl">
          Всё нужное рядом
        </h2>
        <p class="mt-3 text-sm leading-7 text-slate-400 md:text-[15px]">
          Регистрация, скачивание, профиль, карта мира и переходы собраны в один
          компактный тёмный интерфейс.
        </p>
      </div>

      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="feature in siteConfig.features"
          :key="feature.title"
          class="surface-card p-4 md:p-5"
        >
          <div class="feature-icon-box">{{ feature.icon }}</div>
          <h3 class="mt-3 text-lg font-black tracking-tight text-slate-50">
            {{ feature.title }}
          </h3>
          <p class="mt-2 text-sm leading-6 text-slate-400">
            {{ feature.description }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>
