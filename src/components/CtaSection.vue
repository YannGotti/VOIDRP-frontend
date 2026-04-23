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
            Создай аккаунт {{ siteConfig.serverName }} и переходи к игре без лишней путаницы
          </h2>
          <p class="mt-4 max-w-2xl text-base leading-8 text-white/78">
            Регистрация, подтверждение почты, скачивание официального лаунчера и запуск игры
            собраны в один понятный путь без сложных инструкций.
          </p>
        </div>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <RouterLink to="/register" class="btn btn-primary">
            Создать аккаунт
          </RouterLink>
          <RouterLink to="/download-launcher" class="btn btn-light">
            Скачать лаунчер
          </RouterLink>
          <RouterLink to="/profile" class="btn btn-outline">
            Открыть кабинет
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
