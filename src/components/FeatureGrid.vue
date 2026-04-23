<script setup>
import { siteConfig } from '../config.site'
</script>

<template>
  <section class="py-2 md:py-3">
    <div class="container-shell">
      <div class="mb-4 max-w-3xl">
        <div class="section-kicker !mb-2">Всё в одном месте</div>
        <h2 class="text-xl font-black tracking-tight text-slate-50 md:text-2xl">
          Ничего не нужно искать отдельно
        </h2>
        <p class="mt-2 text-sm leading-6 text-slate-400 md:text-[14px]">
          Главная ведёт к игре, кабинет помогает с аккаунтом, а карта, Discord и государства всегда рядом.
        </p>
      </div>

      <div class="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="feature in siteConfig.features"
          :key="feature.title"
          class="surface-card p-4"
        >
          <div class="feature-icon-box">{{ feature.icon }}</div>
          <h3 class="mt-2.5 text-base font-black tracking-tight text-slate-50">
            {{ feature.title }}
          </h3>
          <p class="mt-1.5 text-sm leading-6 text-slate-400">
            {{ feature.description }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>
