<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { siteConfig } from '../config.site'

const externalStatsUrl = computed(() => siteConfig.monitoringChartUrl)

const copySuccess = ref(false)

function copyIp() {
  navigator.clipboard.writeText('void-rp.ru').then(() => {
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  })
}
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
              Информация о сервере
            </div>

            <div class="server-frame__body p-4 md:p-5">
              <div class="server-info-grid">
                <div class="server-info-ip">
                  <p class="server-info-ip__label">Адрес сервера</p>
                  <p class="server-info-ip__value">void-rp.ru</p>
                  <button class="server-info-ip__copy btn btn-primary mt-3" @click="copyIp">
                    <span v-if="copySuccess">Скопировано!</span>
                    <span v-else>Скопировать IP</span>
                  </button>
                </div>

                <div class="server-info-details">
                  <div class="server-info-chip">
                    <span class="server-info-chip__dot"></span>
                    <span>1.21.1 · Better MC 5</span>
                  </div>

                  <p class="server-info-peak">
                    Пик активности: вечером 18–23 МСК
                  </p>

                  <a
                    :href="externalStatsUrl"
                    target="_blank"
                    rel="noreferrer"
                    class="btn btn-outline server-info-monitoring"
                  >
                    Открыть мониторинг
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.server-info-grid {
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 480px) {
  .server-info-grid {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
}

.server-info-ip {
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 1.1rem;
  background: rgba(255,255,255,.03);
  padding: 1.1rem 1.2rem;
  text-align: center;
}

.server-info-ip__label {
  font-size: .7rem;
  font-weight: 800;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: rgb(100 116 139);
  margin-bottom: .35rem;
}

.server-info-ip__value {
  font-size: 1.35rem;
  font-weight: 900;
  letter-spacing: -.01em;
  color: rgb(248 250 252);
  font-family: monospace;
}

.server-info-ip__copy {
  width: 100%;
  justify-content: center;
}

.server-info-details {
  display: flex;
  flex-direction: column;
  gap: .85rem;
}

.server-info-chip {
  display: inline-flex;
  align-items: center;
  gap: .45rem;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 999px;
  background: rgba(255,255,255,.05);
  padding: .35rem .75rem;
  font-size: .8rem;
  font-weight: 700;
  color: rgb(203 213 225);
  align-self: flex-start;
}

.server-info-chip__dot {
  height: 8px;
  width: 8px;
  border-radius: 999px;
  background: rgb(74 222 128);
  box-shadow: 0 0 6px rgb(74 222 128 / 0.7);
  flex-shrink: 0;
}

.server-info-peak {
  font-size: .83rem;
  line-height: 1.55;
  color: rgb(148 163 184);
}

.server-info-monitoring {
  align-self: flex-start;
}
</style>
