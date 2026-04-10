<script setup>
import { siteConfig } from '../config.site'
</script>

<template>
  <section class="py-6 md:py-10">
    <div class="container-shell">
      <div class="surface-card p-5 md:p-7">
        <div class="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:gap-8">
          <div>
            <div class="section-kicker">Активность сервера</div>
            <h2 class="section-title">Посмотри, когда на сервере обычно оживлённее</h2>
            <p class="section-subtitle">
              График помогает понять, когда проще встретить других игроков и когда лучше заходить для совместной игры.
            </p>

            <div class="mt-6 grid gap-3">
              <div class="action-card flex items-start gap-3">
                <span class="mt-2 h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
                <div>
                  <p class="font-bold text-slate-900">График прямо на сайте</p>
                  <p class="mt-1 text-sm leading-6 text-slate-600">Не нужно искать внешний мониторинг отдельно.</p>
                </div>
              </div>
              <div class="action-card flex items-start gap-3">
                <span class="mt-2 h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                <div>
                  <p class="font-bold text-slate-900">Карта мира рядом</p>
                  <p class="mt-1 text-sm leading-6 text-slate-600">Переход на карту и в лаунчер доступен из этого же блока.</p>
                </div>
              </div>
            </div>

            <div class="mt-6 flex flex-wrap gap-3">
              <RouterLink to="/download-launcher" class="btn btn-primary">Скачать лаунчер</RouterLink>
              <a :href="siteConfig.dynmapUrl" target="_blank" rel="noreferrer" class="btn btn-outline">
                Открыть карту
              </a>
            </div>
          </div>

          <div class="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-[0_14px_45px_rgba(15,23,42,0.08)]">
            <div class="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600">
              Онлайн-график активности
            </div>
            <iframe
              :src="siteConfig.monitoringChartUrl"
              width="100%"
              height="320"
              frameborder="0"
              class="block w-full bg-white"
              title="Server activity"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
