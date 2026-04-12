<script setup>
import { siteConfig } from '../config.site'

const links = [
  {
    title: 'Скачать лаунчер',
    description: 'Официальная страница загрузки лаунчера и быстрый переход к запуску игры.',
    internal: '/download-launcher',
    button: 'Скачать лаунчер',
  },
  {
    title: 'Карта мира',
    description: 'Онлайн-карта сервера: маршруты, постройки и обзор мира прямо в браузере.',
    url: siteConfig.dynmapUrl,
    button: 'Открыть карту',
  },
  {
    title: 'Telegram',
    description: 'Новости проекта, анонсы и важные сообщения для игроков.',
    url: siteConfig.telegramUrl,
    button: 'Перейти в Telegram',
  },
  {
    title: 'Главная страница',
    description: 'Быстрый возврат на основной сайт со стартовой страницей и кабинетом.',
    url: siteConfig.siteUrl,
    button: 'Открыть сайт',
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
            Карта мира, Telegram, сайт и страница скачивания лаунчера собраны в одном
            аккуратном разделе без лишней визуальной перегрузки.
          </p>
        </div>
      </section>

      <section class="grid gap-4 md:grid-cols-2">
        <article
          v-for="item in links"
          :key="item.title"
          class="surface-card p-5 md:p-6"
        >
          <div class="section-kicker !mb-2">Ссылка</div>
          <h2 class="text-xl font-black tracking-tight text-slate-50 md:text-2xl">
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
