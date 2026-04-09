<script setup>
import { siteConfig } from '../config.site'
</script>

<template>
  <section class="py-10 md:py-14">
    <div class="container-shell">
      <div class="cta-shell">
        <div class="max-w-3xl">
          <div class="section-kicker section-kicker--light">Готов начать</div>
          <h2 class="text-3xl font-black leading-tight md:text-5xl">
            Создай аккаунт {{ siteConfig.serverName }} и переходи к игре
          </h2>
          <p class="mt-4 text-lg leading-8 text-white/80">
            Начни с регистрации на сайте, потом скачай официальный лаунчер и заходи на сервер.
          </p>
        </div>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <RouterLink
            to="/register"
            class="btn btn-primary btn-lg rounded-2xl bg-white text-slate-950 hover:bg-white/90"
          >
            Создать аккаунт
          </RouterLink>
          <RouterLink
            to="/download-launcher"
            class="btn btn-outline btn-lg rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10"
          >
            Скачать лаунчер
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
