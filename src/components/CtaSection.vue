<script setup>
import { siteConfig } from '../config.site'
</script>

<template>
  <section class="py-5 md:py-6">
    <div class="container-shell">
      <div class="gradient-panel p-5 md:p-6">
        <div class="max-w-3xl">
          <div class="section-kicker section-kicker--light">Готово к старту</div>
          <h2 class="text-2xl font-black leading-tight tracking-tight text-white md:text-[2.5rem]">
            Создай аккаунт {{ siteConfig.serverName }} и переходи к игре
          </h2>
          <p class="mt-3 max-w-2xl text-sm leading-7 text-white/78 md:text-[15px]">
            Регистрация, письмо, лаунчер и запуск игры собраны в один короткий понятный путь.
          </p>
        </div>

        <div class="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
          <RouterLink to="/register" class="btn btn-primary">Создать аккаунт</RouterLink>
          <RouterLink to="/download-launcher" class="btn btn-light">Скачать лаунчер</RouterLink>
          <a :href="siteConfig.discordUrl" target="_blank" rel="noreferrer" class="btn btn-outline">Discord</a>
        </div>
      </div>
    </div>
  </section>
</template>
