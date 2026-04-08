<script setup>
import { siteConfig } from '../config.site'
</script>

<template>
  <section class="py-8 md:py-12">
    <div class="container-shell">
      <div class="mb-8 max-w-3xl">
        <div class="section-kicker">Все для старта</div>
        <h2 class="section-title">На сайте собрано все, что нужно игроку</h2>
        <p class="section-subtitle">
          Здесь можно быстро скачать лаунчер, открыть карту мира и перейти к важным ссылкам проекта.
        </p>
      </div>

      <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="feature in siteConfig.features"
          :key="feature.title"
          class="feature-card group"
        >
          <div class="feature-card__icon">{{ feature.icon }}</div>
          <h3 class="feature-card__title">{{ feature.title }}</h3>
          <p class="feature-card__text">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>