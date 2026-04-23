<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { siteConfig } from '../config.site'

const externalStatsUrl = computed(() => siteConfig.monitoringChartUrl)
</script>

<template>
  <section class="py-6 md:py-10">
    <div class="container-shell">
      <div class="surface-card p-5 md:p-7">
        <div class="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:gap-8">
          <div>
            <div class="section-kicker">Активность сервера</div>
            <h2 class="section-title">Когда на сервере больше игроков</h2>
            <p class="section-subtitle">
              Внешний сервис показывает онлайн за последние сутки. Мы оформили блок под стиль сайта,
              но сам график внутри iframe рисует сторонний сайт.
            </p>

            <div class="mt-6 grid gap-3">
              <div class="action-card flex items-start gap-3">
                <span class="mt-2 h-2.5 w-2.5 rounded-full bg-indigo-400"></span>
                <div>
                  <p class="font-bold text-slate-100">Быстрый ориентир</p>
                  <p class="mt-1 text-sm leading-6 text-slate-400">
                    Смотри, в какие часы на сервере чаще бывает движ.
                  </p>
                </div>
              </div>

              <div class="action-card flex items-start gap-3">
                <span class="mt-2 h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                <div>
                  <p class="font-bold text-slate-100">Открывается отдельно</p>
                  <p class="mt-1 text-sm leading-6 text-slate-400">
                    Если нужен полный вид, открой график в новой вкладке.
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-6 flex flex-wrap gap-3">
              <RouterLink to="/download-launcher" class="btn btn-primary">Скачать лаунчер</RouterLink>
              <a :href="siteConfig.dynmapUrl" target="_blank" rel="noreferrer" class="btn btn-outline">
                Открыть карту
              </a>
              <a :href="externalStatsUrl" target="_blank" rel="noreferrer" class="btn btn-outline">
                Открыть график отдельно
              </a>
            </div>
          </div>

          <div class="server-frame rounded-[1.8rem] border border-white/10 bg-slate-950/70 shadow-[0_14px_45px_rgba(0,0,0,0.35)]">
            <div class="server-frame__header border-b border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200">
              Онлайн за последние 24 часа
            </div>

            <div class="server-frame__body p-3">
              <div class="relative overflow-hidden rounded-[1.3rem] border border-white/10 bg-slate-900">
                <iframe
                  :src="externalStatsUrl"
                  width="100%"
                  height="320"
                  frameborder="0"
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                  class="block w-full bg-white"
                  title="График активности сервера"
                ></iframe>

                <div class="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-slate-950/14 to-transparent"></div>
              </div>

              <p class="mt-3 text-xs leading-5 text-slate-500">
                Важно: внутренние цвета, шрифты и сетку этого графика нельзя полноценно перекрасить стилями сайта,
                потому что это содержимое чужого домена в iframe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
