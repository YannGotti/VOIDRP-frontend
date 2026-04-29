<script setup>
import { siteConfig } from '../config.site'

const ICON_LOCK = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`
const ICON_ROCKET = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`
const ICON_USER = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
const ICON_GRID = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`

function featureIcon(title) {
  switch (title) {
    case 'Один вход': return ICON_LOCK
    case 'Быстрый старт': return ICON_ROCKET
    case 'Живой профиль': return ICON_USER
    default: return ICON_GRID
  }
}
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
          <div class="feature-icon-box" v-html="featureIcon(feature.title)"></div>
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
