<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { siteConfig } from '../config.site'

const externalStatsUrl = computed(() => siteConfig.monitoringChartUrl)
</script>

<template>
  <section class="py-4 md:py-5">
    <div class="container-shell">
      <div class="surface-card p-4 md:p-5">
        <div class="grid gap-4 lg:grid-cols-[0.78fr_1.22fr] lg:gap-5">
          <div>
            <div class="section-kicker">Активность сервера</div>
            <h2 class="section-title">Когда на сервере больше людей</h2>
            <p class="section-subtitle">
              Это внешний график за последние сутки. Блок встроен на сайт, но сам график рисует сторонний сервис.
            </p>

            <div class="mt-4 grid gap-2.5">
              <div class="action-card flex items-start gap-3">
                <span class="mt-2 h-2.5 w-2.5 rounded-full bg-indigo-400"></span>
                <div>
                  <p class="font-bold text-slate-100">Быстрый ориентир</p>
                  <p class="mt-1 text-sm leading-6 text-slate-400">
                    Помогает понять, когда на сервере чаще идёт движ.
                  </p>
                </div>
              </div>

              <div class="action-card flex items-start gap-3">
                <span class="mt-2 h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                <div>
                  <p class="font-bold text-slate-100">Полный вид отдельно</p>
                  <p class="mt-1 text-sm leading-6 text-slate-400">
                    При желании можно открыть график в новой вкладке.
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-4 flex flex-wrap gap-2.5">
              <RouterLink to="/download-launcher" class="btn btn-primary">Скачать лаунчер</RouterLink>
              <a :href="siteConfig.dynmapUrl" target="_blank" rel="noreferrer" class="btn btn-outline">Карта</a>
              <a :href="externalStatsUrl" target="_blank" rel="noreferrer" class="btn btn-outline">График</a>
            </div>
          </div>

          <div class="server-frame rounded-[1.5rem] border border-white/10 bg-slate-950/70 shadow-[0_14px_38px_rgba(0,0,0,0.28)]">
            <div class="server-frame__header border-b border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-semibold text-slate-200">
              Онлайн за последние 24 часа
            </div>

            <div class="server-frame__body p-2.5">
              <div class="relative overflow-hidden rounded-[1.05rem] border border-white/10 bg-slate-900">
                <iframe
                  :src="externalStatsUrl"
                  width="100%"
                  height="290"
                  frameborder="0"
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                  class="block w-full bg-white"
                  title="График активности сервера"
                ></iframe>

                <div class="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-slate-950/14 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
