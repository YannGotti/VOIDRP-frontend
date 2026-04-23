<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getNationRankings } from '../services/nationStatsApi'
import { useAuthStore } from '../stores/authStore'
import { formatCompactHoursFromMinutes, formatNumber } from '../utils/formatters'

const auth = useAuthStore()
const loading = ref(true)
const error = ref('')
const rankings = ref([])

async function loadRankings() {
  loading.value = true
  error.value = ''

  try {
    const payload = await getNationRankings(auth.accessToken || null)
    rankings.value = payload?.items || []
  } catch (err) {
    error.value = err.message || 'Не удалось загрузить рейтинг государств.'
  } finally {
    loading.value = false
  }
}

onMounted(loadRankings)
</script>

<template>
  <section class="py-5 md:py-6">
    <div class="container-shell max-w-[1380px] space-y-4">
      <section class="surface-card p-4 md:p-5">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div class="section-kicker !mb-2">Рейтинг</div>
            <h1 class="text-2xl font-black tracking-tight text-slate-50 md:text-3xl">
              Топ государств
            </h1>
            <p class="mt-3 max-w-3xl text-sm leading-6 text-slate-400 md:text-[14px]">
              Короткий рейтинг по силе государства: активность, экономика, территория и общий вклад участников.
            </p>
          </div>

          <div class="grid gap-2.5 sm:grid-cols-2">
            <RouterLink to="/nations" class="btn btn-outline">Назад к каталогу</RouterLink>
            <RouterLink to="/nation/studio" class="btn btn-primary">Создать или настроить своё</RouterLink>
          </div>
        </div>
      </section>

      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <div v-if="loading" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <div class="skeleton h-52 rounded-[24px]"></div>
        <div class="skeleton h-52 rounded-[24px]"></div>
        <div class="skeleton h-52 rounded-[24px]"></div>
        <div class="skeleton h-52 rounded-[24px]"></div>
      </div>

      <section v-else-if="!rankings.length" class="surface-card p-5 md:p-6">
        <div class="max-w-2xl">
          <div class="section-kicker">Пока пусто</div>
          <h2 class="text-xl font-black tracking-tight text-slate-50">
            Рейтинг ещё не собран
          </h2>
          <p class="mt-3 text-sm leading-6 text-slate-400">
            Нужен первый sync статистики с игрового сервера.
          </p>
        </div>
      </section>

      <section v-else class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <article
          v-for="(item, index) in rankings"
          :key="item.nation_id || item.slug || item.title"
          class="surface-card p-4 ranking-card-compact"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-start gap-3">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-black text-slate-50">
                #{{ index + 1 }}
              </div>

              <div class="preview-avatar h-12 w-12 shrink-0 border border-white/10 text-sm">
                <img v-if="item.icon_url" :src="item.icon_url" alt="icon" class="h-full w-full object-cover" />
                <span v-else>{{ item.tag?.slice(0, 2).toUpperCase() }}</span>
              </div>

              <div class="min-w-0">
                <h2 class="truncate text-lg font-black tracking-tight text-slate-50">
                  {{ item.title }}
                </h2>
                <p class="mt-1 text-sm leading-5 text-slate-400">
                  [{{ item.tag }}] · {{ formatNumber(item.members_count ?? 0) }} уч.
                </p>
              </div>
            </div>
          </div>

          <div class="metric-grid metric-grid-2 mt-4">
            <div class="metric-card text-center">
              <p class="metric-value !text-[1.05rem]">{{ formatNumber(item.score ?? 0) }}</p>
              <p class="mt-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Score</p>
            </div>

            <div class="metric-card text-center">
              <p class="metric-value !text-[1.05rem]">{{ formatNumber(item.treasury_balance ?? 0) }}</p>
              <p class="mt-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Баланс</p>
            </div>

            <div class="metric-card text-center">
              <p class="metric-value !text-[1.05rem]">{{ formatNumber(item.territory_points ?? 0) }}</p>
              <p class="mt-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Территория</p>
            </div>

            <div class="metric-card text-center">
              <p class="metric-value !text-[1.05rem]">{{ formatCompactHoursFromMinutes(item.total_playtime_minutes ?? 0) }}</p>
              <p class="mt-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Онлайн</p>
            </div>
          </div>

          <RouterLink :to="`/nation/${item.slug}`" class="btn btn-primary mt-4 w-full">Открыть страницу</RouterLink>
        </article>
      </section>
    </div>
  </section>
</template>

<style scoped>
.ranking-card-compact {
  min-height: 100%;
}
</style>
