<script setup>
import { siteConfig } from '../config.site'

const links = [
  {
    title: 'Скачать лаунчер',
    description: 'Официальная страница загрузки лаунчера и быстрый путь к запуску игры.',
    internal: '/download-launcher',
    button: 'Скачать лаунчер',
    tag: 'Старт',
  },
  {
    title: 'Карта мира',
    description: 'Онлайн-карта сервера: маршруты, города, регионы и обзор мира прямо в браузере.',
    url: siteConfig.dynmapUrl,
    button: 'Открыть карту',
    tag: 'Мир',
  },
  {
    title: 'Telegram',
    description: 'Новости проекта, анонсы и важные сообщения для игроков в одном месте.',
    url: siteConfig.telegramUrl,
    button: 'Перейти в Telegram',
    tag: 'Связь',
  },
  {
    title: 'Главная страница',
    description: 'Возврат на стартовый экран с путём к игре, кабинетам и навигацией по сайту.',
    url: siteConfig.siteUrl,
    button: 'Открыть сайт',
    tag: 'Навигация',
  },
]
</script>

<template>
  <section class="py-8 md:py-10">
    <div class="container-shell space-y-5">
      <section class="surface-card p-5 md:p-7">
        <div class="max-w-3xl">
          <div class="section-kicker !mb-2">Полезные ссылки</div>
          <h1 class="text-3xl font-black tracking-tight text-slate-50 md:text-4xl">
            Всё важное под рукой
          </h1>
          <p class="mt-4 text-sm leading-7 text-slate-400 md:text-[15px]">
            Карта мира, Telegram, сайт и загрузка лаунчера собраны в одном спокойном разделе.
            Игроку не нужно искать их по разным углам интерфейса.
          </p>
        </div>
      </section>

      <section class="grid gap-4 md:grid-cols-2">
        <article
          v-for="item in links"
          :key="item.title"
          class="surface-card p-5 md:p-6"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="section-kicker !mb-0">{{ item.tag }}</div>
            <div class="footer-chip">Быстрый переход</div>
          </div>

          <h2 class="mt-4 text-xl font-black tracking-tight text-slate-50 md:text-2xl">
            {{ item.title }}
          </h2>
          <p class="mt-3 text-sm leading-7 text-slate-400">
            {{ item.description }}
          </p>

          <RouterLink
            v-if="item.internal"
            :to="item.internal"
            class="btn btn-primary mt-5 w-full sm:w-auto"
          >
            {{ item.button }}
          </RouterLink>

          <a
            v-else
            :href="item.url"
            target="_blank"
            rel="noreferrer"
            class="btn btn-primary mt-5 w-full sm:w-auto"
          >
            {{ item.button }}
          </a>
        </article>
      </section>
    </div>
  </section>
</template>
