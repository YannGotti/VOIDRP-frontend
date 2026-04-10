<script setup>
import { siteConfig } from '../config.site'

const links = [
  {
    title: 'Скачать лаунчер',
    description: 'Главная страница скачивания официального лаунчера и быстрый путь к запуску игры.',
    internal: '/download-launcher',
    button: 'Перейти к скачиванию',
  },
  {
    title: 'Карта мира',
    description: 'Онлайн-карта сервера, где можно смотреть мир, маршруты и интересные места прямо из браузера.',
    url: siteConfig.dynmapUrl,
    button: 'Открыть карту',
  },
  {
    title: 'Telegram',
    description: 'Новости проекта, анонсы и важные сообщения для игроков в одном канале.',
    url: siteConfig.telegramUrl,
    button: 'Перейти в Telegram',
  },
  {
    title: 'Главная страница',
    description: 'Возврат на основной сайт со стартовой страницей, кабинетом и навигацией по проекту.',
    url: siteConfig.siteUrl,
    button: 'Открыть главную',
  },
]
</script>

<template>
  <section class="py-12 md:py-18">
    <div class="container-shell">
      <div class="max-w-3xl">
        <div class="section-kicker">Полезные ссылки</div>
        <h1 class="section-title">Всё важное в одном месте</h1>
        <p class="section-subtitle">
          Карта мира, Telegram, главная страница и скачивание лаунчера вынесены в отдельный понятный раздел без визуальной каши.
        </p>
      </div>

      <div class="mt-10 grid gap-5 md:grid-cols-2">
        <article v-for="item in links" :key="item.title" class="surface-card p-6 md:p-7">
          <div class="section-kicker">Ссылка</div>
          <h2 class="text-2xl font-black tracking-tight text-slate-950">{{ item.title }}</h2>
          <p class="mt-4 text-sm leading-7 text-slate-600">{{ item.description }}</p>

          <RouterLink v-if="item.internal" :to="item.internal" class="btn btn-primary mt-6">
            {{ item.button }}
          </RouterLink>
          <a v-else :href="item.url" target="_blank" rel="noreferrer" class="btn btn-primary mt-6">
            {{ item.button }}
          </a>
        </article>
      </div>
    </div>
  </section>
</template>
