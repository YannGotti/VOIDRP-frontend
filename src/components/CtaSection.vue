<script setup>
import { siteConfig } from '../config.site'
</script>

<template>
  <section class="py-8 md:py-12">
    <div class="container-shell">
      <div class="gradient-panel p-6 md:p-8">
        <div class="max-w-3xl">
          <div class="section-kicker section-kicker--light">Готово к старту</div>
          <h2 class="text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
            Создай аккаунт {{ siteConfig.serverName }} и переходи к игре без лишних шагов
          </h2>
          <p class="mt-4 max-w-2xl text-base leading-8 text-white/78">
            Регистрация, подтверждение почты, скачивание официального лаунчера и запуск собраны в цельный понятный путь.
          </p>
        </div>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <RouterLink to="/register" class="btn btn-primary bg-white !text-slate-950 shadow-none">
            Создать аккаунт
          </RouterLink>
          <RouterLink to="/download-launcher" class="btn btn-light">
            Скачать лаунчер
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
