<script setup>
import { siteConfig } from '../config.site'
</script>

<template>
  <section class="py-6 md:py-10">
    <div class="container-shell">
      <div class="glass-card rounded-[32px] p-6 md:p-8">
        <div class="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <div
              class="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              <span class="h-2 w-2 rounded-full bg-primary"></span>
              Активность сервера
            </div>

            <h2 class="section-title !mb-0">Смотри, когда сервер особенно активен</h2>
            <p class="section-subtitle mt-4">
              Здесь можно быстро посмотреть активность проекта и понять, в какое время на сервере больше игроков.
            </p>

            <div class="mt-6 grid gap-3">
              <div class="soft-line-card">
                <span class="soft-line-card__dot bg-primary"></span>
                Следи за активностью сервера в удобном графике.
              </div>
              <div class="soft-line-card">
                <span class="soft-line-card__dot bg-emerald-400"></span>
                Переходи на карту мира и планируй свои путешествия.
              </div>
              <div class="soft-line-card">
                <span class="soft-line-card__dot bg-violet-400"></span>
                Сначала создай аккаунт, а затем переходи к скачиванию официального лаунчера.
              </div>
            </div>

            <div class="mt-6 flex flex-wrap gap-3">
              <RouterLink to="/download-launcher" class="btn btn-primary rounded-2xl">
                Скачать лаунчер
              </RouterLink>
              <a
                :href="siteConfig.dynmapUrl"
                target="_blank"
                rel="noreferrer"
                class="btn btn-outline rounded-2xl"
              >
                Карта мира
              </a>
            </div>
          </div>

          <div class="rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_15px_60px_rgba(15,23,42,0.08)]">
            <div class="monitor-shell">
              <iframe
                :src="siteConfig.monitoringChartUrl"
                width="100%"
                height="300"
                frameborder="0"
                class="monitor-frame"
              ></iframe>
            </div>

            <div class="mt-4 rounded-[20px] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600">
              Если график не загрузился сразу, просто обнови страницу или открой мониторинг позже.
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
