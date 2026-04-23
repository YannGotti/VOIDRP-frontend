<script setup>
import { siteConfig } from '../config.site'

const links = [
  {
    title: 'Скачать лаунчер',
    description: 'Официальная загрузка лаунчера и быстрый путь к старту игры.',
    internal: '/download-launcher',
    button: 'Скачать лаунчер',
    tag: 'Старт',
  },
  {
    title: 'Карта мира',
    description: 'Онлайн-карта сервера: города, регионы, маршруты и обзор мира в браузере.',
    url: siteConfig.dynmapUrl,
    button: 'Открыть карту',
    tag: 'Мир',
  },
  {
    title: 'Discord',
    description: 'Общение, анонсы, новости сервера и связь с игроками в одном месте.',
    url: siteConfig.discordUrl,
    button: 'Перейти в Discord',
    tag: 'Сообщество',
  },
  {
    title: 'Telegram',
    description: 'Новости проекта, объявления и важные сообщения для игроков.',
    url: siteConfig.telegramUrl,
    button: 'Перейти в Telegram',
    tag: 'Новости',
  },
  {
    title: 'Главная страница',
    description: 'Возврат на стартовый экран с путём к игре и всей навигацией по сайту.',
    url: siteConfig.siteUrl,
    button: 'Открыть сайт',
    tag: 'Навигация',
  },
]
</script>

<template>
  <section class="py-5 md:py-6">
    <div class="container-shell space-y-4">
      <section class="surface-card p-4 md:p-5">
        <div class="max-w-3xl">
          <div class="section-kicker !mb-2">Полезные ссылки</div>
          <h1 class="text-2xl font-black tracking-tight text-slate-50 md:text-3xl">
            Всё важное под рукой
          </h1>
          <p class="mt-3 text-sm leading-6 text-slate-400 md:text-[14px]">
            Карта, Discord, Telegram, сайт и загрузка лаунчера собраны в одном спокойном разделе.
          </p>
        </div>
      </section>

      <section class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="item in links"
          :key="item.title"
          class="surface-card p-4 md:p-5"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="section-kicker !mb-0">{{ item.tag }}</div>
            <div class="footer-chip">Быстрый переход</div>
          </div>

          <h2 class="mt-3 text-lg font-black tracking-tight text-slate-50 md:text-xl">
            {{ item.title }}
          </h2>
          <p class="mt-2 text-sm leading-6 text-slate-400">
            {{ item.description }}
          </p>

          <RouterLink
            v-if="item.internal"
            :to="item.internal"
            class="btn btn-primary mt-4 w-full sm:w-auto"
          >
            {{ item.button }}
          </RouterLink>

          <a
            v-else
            :href="item.url"
            target="_blank"
            rel="noreferrer"
            class="btn btn-primary mt-4 w-full sm:w-auto"
          >
            {{ item.button }}
          </a>
        </article>
      </section>
    </div>
  </section>
</template>
