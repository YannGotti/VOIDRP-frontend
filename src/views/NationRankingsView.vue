<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getNationRankings } from '../services/nationStatsApi'
import { useAuthStore } from '../stores/authStore'

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

function playtimeText(minutes) {
  const hours = Math.floor((minutes || 0) / 60)
  return `${hours} ч`
}

onMounted(loadRankings)
</script>

<template>
  <section class="py-8 md:py-10">
    <div class="container-shell space-y-5">
      <section class="surface-card p-5 md:p-7">
        <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div class="section-kicker !mb-2">Рейтинг</div>
            <h1 class="text-3xl font-black tracking-tight text-slate-50 md:text-4xl">
              Топ государств
            </h1>
            <p class="mt-4 max-w-3xl text-sm leading-7 text-slate-400 md:text-[15px]">
              Общий рейтинг по силе государства: активность участников, экономика,
              территория и суммарный вклад сообщества.
            </p>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <RouterLink to="/nations" class="btn btn-outline">Назад к каталогу</RouterLink>
            <RouterLink to="/nation/studio" class="btn btn-primary">Создать или настроить своё</RouterLink>
          </div>
        </div>
      </section>

      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <div v-if="loading" class="space-y-4">
        <div class="skeleton h-28 rounded-[28px]"></div>
        <div class="skeleton h-28 rounded-[28px]"></div>
        <div class="skeleton h-28 rounded-[28px]"></div>
      </div>

      <section v-else-if="!rankings.length" class="surface-card p-6 md:p-7">
        <div class="max-w-2xl">
          <div class="section-kicker">Пока пусто</div>
          <h2 class="text-2xl font-black tracking-tight text-slate-50">
            Рейтинг ещё не собран
          </h2>
          <p class="mt-4 text-sm leading-7 text-slate-400">
            Нужен первый sync статистики с игрового сервера.
          </p>
        </div>
      </section>

      <section v-else class="space-y-4">
        <article
          v-for="(item, index) in rankings"
          :key="item.nation_id || item.slug || item.title"
          class="surface-card p-5 md:p-6"
        >
          <div class="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div class="flex min-w-0 items-center gap-4">
              <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border border-white/10 bg-white/5 text-lg font-black text-slate-50">
                #{{ index + 1 }}
              </div>

              <div class="preview-avatar h-16 w-16 shrink-0 border border-white/10 text-lg">
                <img v-if="item.icon_url" :src="item.icon_url" alt="icon" class="h-full w-full object-cover" />
                <span v-else>{{ item.tag?.slice(0, 2).toUpperCase() }}</span>
              </div>

              <div class="min-w-0">
                <h2 class="truncate text-xl font-black tracking-tight text-slate-50">
                  {{ item.title }}
                </h2>
                <p class="mt-2 text-sm leading-6 text-slate-400">
                  [{{ item.tag }}] · Участники: {{ item.members_count ?? 0 }}
                </p>
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-2 xl:min-w-[560px] xl:grid-cols-4">
              <div class="metric-card text-center">
                <p class="metric-value !text-[1.15rem]">{{ item.score ?? 0 }}</p>
                <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Score</p>
              </div>

              <div class="metric-card text-center">
                <p class="metric-value !text-[1.15rem]">{{ item.treasury_balance ?? 0 }}</p>
                <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Баланс</p>
              </div>

              <div class="metric-card text-center">
                <p class="metric-value !text-[1.15rem]">{{ item.territory_points ?? 0 }}</p>
                <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Территория</p>
              </div>

              <div class="metric-card text-center">
                <p class="metric-value !text-[1.15rem]">{{ playtimeText(item.total_playtime_minutes ?? 0) }}</p>
                <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Онлайн</p>
              </div>
            </div>
          </div>

          <div class="mt-5 flex flex-wrap gap-3">
            <RouterLink :to="`/nation/${item.slug}`" class="btn btn-primary">Открыть страницу</RouterLink>
          </div>
        </article>
      </section>
    </div>
  </section>
</template>
