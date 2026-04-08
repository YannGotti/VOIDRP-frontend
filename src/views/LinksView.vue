<script setup>
import { siteConfig } from '../config.site'

const links = [
  {
    title: 'Карта мира',
    description: 'Онлайн-карта сервера для просмотра мира, маршрутов и интересных мест.',
    url: siteConfig.dynmapUrl,
    button: 'Открыть карту',
  },
  {
    title: 'Telegram',
    description: 'Новости проекта, анонсы и важные сообщения для игроков.',
    url: siteConfig.telegramUrl,
    button: 'Открыть Telegram',
  },
  {
    title: 'Сайт проекта',
    description: 'Основная страница проекта, где собрана важная информация о сервере.',
    url: siteConfig.siteUrl,
    button: 'Открыть сайт',
  },
]
</script>

<template>
  <section class="py-16 md:py-24">
    <div class="container-shell">
      <div class="max-w-3xl">
        <div class="section-kicker">Полезные ссылки</div>
        <h1 class="section-title">Все важные ссылки в одном месте</h1>
        <p class="section-subtitle">
          Открывай карту мира, следи за новостями и быстро переходи к главным страницам проекта.
        </p>
      </div>

      <div class="mt-10 grid gap-6 md:grid-cols-2">
        <div v-for="item in links" :key="item.title" class="glass-card rounded-[32px] p-8">
          <div
            class="mb-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-500"
          >
            Полезная ссылка
          </div>

          <h2 class="text-2xl font-black text-slate-900">{{ item.title }}</h2>
          <p class="mt-4 leading-7 text-slate-600">{{ item.description }}</p>

          <a
            :href="item.url"
            target="_blank"
            rel="noreferrer"
            class="btn btn-primary mt-6 rounded-2xl"
          >
            {{ item.button }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>