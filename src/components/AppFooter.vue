<script setup>
import { siteConfig } from '../config.site'
</script>

<template>
  <footer class="relative z-10 mt-8 pb-6 pt-2 md:mt-10">
    <div class="container-shell space-y-3">
      <div class="surface-card p-4 md:p-5">
        <div class="grid gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div class="max-w-3xl">
            <p class="text-base font-black tracking-tight text-slate-50 md:text-lg">
              {{ siteConfig.serverName }}
            </p>
            <p class="mt-2 text-sm leading-6 text-slate-400">
              Один понятный путь к игре: аккаунт, лаунчер, карта, Discord, государства и публичный профиль.
            </p>
          </div>

          <div class="flex flex-wrap gap-2 lg:justify-end">
            <a :href="siteConfig.siteUrl" target="_blank" rel="noreferrer" class="footer-chip">Сайт</a>
            <a :href="siteConfig.dynmapUrl" target="_blank" rel="noreferrer" class="footer-chip">Карта</a>
            <a :href="siteConfig.discordUrl" target="_blank" rel="noreferrer" class="footer-chip">Discord</a>
            <a :href="siteConfig.telegramUrl" target="_blank" rel="noreferrer" class="footer-chip">Telegram</a>
            <RouterLink to="/download-launcher" class="footer-chip">Лаунчер</RouterLink>
          </div>
        </div>
      </div>

      <div class="px-1 text-center text-[11px] text-slate-500">
        © 2026 VoidRP · Компактный интерфейс для обычного игрока.
      </div>
    </div>
  </footer>
</template>
