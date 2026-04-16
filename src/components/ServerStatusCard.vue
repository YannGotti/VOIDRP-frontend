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
            <h2 class="section-title">Зайди тогда, когда мир живее</h2>
            <p class="section-subtitle">
              График помогает понять, когда на сервере чаще встречаются другие игроки и
              когда удобнее планировать совместную игру.
            </p>

            <div class="mt-6 grid gap-3">
              <div class="action-card flex items-start gap-3">
                <span class="mt-2 h-2.5 w-2.5 rounded-full bg-indigo-400"></span>
                <div>
                  <p class="font-bold text-slate-100">График прямо на сайте</p>
                  <p class="mt-1 text-sm leading-6 text-slate-400">
                    Не нужно искать внешний мониторинг отдельно.
                  </p>
                </div>
              </div>
              <div class="action-card flex items-start gap-3">
                <span class="mt-2 h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                <div>
                  <p class="font-bold text-slate-100">Карта мира рядом</p>
                  <p class="mt-1 text-sm leading-6 text-slate-400">
                    Отсюда же можно перейти на карту и к загрузке лаунчера.
                  </p>
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

          <div class="server-frame overflow-hidden rounded-[1.8rem] border shadow-[0_14px_45px_rgba(0,0,0,0.35)]">
            <div class="server-frame__header">
              Онлайн-график активности
            </div>
            <iframe
              :src="siteConfig.monitoringChartUrl"
              width="100%"
              height="320"
              frameborder="0"
              class="block w-full bg-dark"
              title="Server activity"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
