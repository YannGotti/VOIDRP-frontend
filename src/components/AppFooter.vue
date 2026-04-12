<script setup>
import { siteConfig } from '../config.site'
</script>

<template>
  <footer class="relative z-10 mt-12 pb-8 pt-3 md:mt-16">
    <div class="container-shell">
      <div class="surface-card p-5 md:p-7">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div class="max-w-2xl">
            <p class="text-lg font-black tracking-tight text-slate-50 md:text-xl">
              {{ siteConfig.serverName }}
            </p>
            <p class="mt-2 text-sm leading-7 text-slate-400">
              Официальный сайт проекта: аккаунт, государства, публичные профили, карта мира
              и быстрый путь к игре без визуального мусора.
            </p>
          </div>

          <div class="flex flex-wrap gap-2.5">
            <a :href="siteConfig.siteUrl" target="_blank" rel="noreferrer" class="footer-chip">
              void-rp.ru
            </a>
            <a :href="siteConfig.dynmapUrl" target="_blank" rel="noreferrer" class="footer-chip">
              Карта мира
            </a>
            <a :href="siteConfig.telegramUrl" target="_blank" rel="noreferrer" class="footer-chip">
              Telegram
            </a>
            <span class="footer-chip">Minecraft {{ siteConfig.serverVersion }}</span>
          </div>
        </div>
      </div>

      <div class="mt-4 px-1 text-center text-xs text-slate-500">
        © 2026 VoidRP. Все основные разделы собраны в одном аккуратном интерфейсе.
      </div>
    </div>
  </footer>
</template>
