<script setup>
import { siteConfig } from '../config.site'
</script>

<template>
  <footer class="relative z-10 mt-12 pb-8 pt-3 md:mt-16">
    <div class="container-shell space-y-4">
      <div class="surface-card p-5 md:p-7">
        <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div class="max-w-3xl">
            <p class="text-lg font-black tracking-tight text-slate-50 md:text-xl">
              {{ siteConfig.serverName }}
            </p>
            <p class="mt-2 text-sm leading-7 text-slate-400">
              Игроку не нужно разбираться в технических деталях. Сайт даёт один понятный путь:
              аккаунт, лаунчер, карта мира, государства и публичный профиль.
            </p>
          </div>

          <div class="flex flex-wrap gap-2.5 lg:justify-end">
            <a :href="siteConfig.siteUrl" target="_blank" rel="noreferrer" class="footer-chip">
              Сайт
            </a>
            <a :href="siteConfig.dynmapUrl" target="_blank" rel="noreferrer" class="footer-chip">
              Карта мира
            </a>
            <a :href="siteConfig.telegramUrl" target="_blank" rel="noreferrer" class="footer-chip">
              Telegram
            </a>
            <RouterLink to="/download-launcher" class="footer-chip">Лаунчер</RouterLink>
          </div>
        </div>
      </div>

      <div class="px-1 text-center text-xs text-slate-500">
        © 2026 VoidRP · Тёмный player-first интерфейс для обычного игрока.
      </div>
    </div>
  </footer>
</template>
