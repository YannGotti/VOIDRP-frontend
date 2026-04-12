<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getMyNation, getNationsList } from '../services/nationsApi'
import { getNationRankings } from '../services/nationStatsApi'
import { useAuthStore } from '../stores/authStore'

const auth = useAuthStore()

const loading = ref(true)
const error = ref('')
const nations = ref({ total: 0, items: [] })
const myNation = ref(null)
const topThree = ref([])

const emptyText = computed(() => {
  if (!auth.isAuthenticated.value) {
    return 'Войди в аккаунт, чтобы создать своё государство или отправить заявку.'
  }

  return 'Пока государств нет. Можно стать первым и создать своё.'
})

async function loadPage() {
  loading.value = true
  error.value = ''

  try {
    const [listPayload, myPayload, rankingPayload] = await Promise.all([
      getNationsList(auth.accessToken || null),
      auth.isAuthenticated.value ? getMyNation(auth.accessToken) : Promise.resolve(null),
      getNationRankings(auth.accessToken || null),
    ])

    nations.value = listPayload || { total: 0, items: [] }
    myNation.value = myPayload || null
    topThree.value = (rankingPayload?.items || []).slice(0, 3)
  } catch (err) {
    error.value = err.message || 'Не удалось загрузить государства.'
  } finally {
    loading.value = false
  }
}

function recruitmentLabel(value) {
  if (value === 'open') return 'Свободное вступление'
  if (value === 'request') return 'По заявке'
  return 'Только по приглашению'
}

function accentStyle(value) {
  return {
    backgroundColor: value || '#8b5cf6',
  }
}

onMounted(loadPage)
</script>

<template>
  <section class="py-8 md:py-10">
    <div class="container-shell space-y-5">
      <section class="surface-card p-5 md:p-6">
        <div class="grid gap-5 xl:grid-cols-[1.08fr_0.92fr] xl:items-end">
          <div>
            <div class="section-kicker !mb-2">Государства</div>
            <h1 class="text-3xl font-black tracking-tight text-slate-50 md:text-4xl">
              Сообщества игроков
            </h1>
            <p class="mt-4 max-w-3xl text-sm leading-7 text-slate-400 md:text-[15px]">
              Публичные страницы государств, вступление, краткая статистика и быстрый
              переход к своему сообществу без раздутых блоков.
            </p>

            <div class="mt-4 flex flex-wrap gap-2.5">
              <span class="footer-chip">Всего: {{ nations.total || nations.items.length || 0 }}</span>
              <span class="footer-chip">Публичный каталог</span>
              <span class="footer-chip">Dark UI</span>
            </div>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <RouterLink to="/nations/rankings" class="btn btn-outline">
              Смотреть рейтинг
            </RouterLink>

            <RouterLink
              v-if="auth.isAuthenticated.value"
              to="/nation/studio"
              class="btn btn-primary"
            >
              {{ myNation ? 'Управление государством' : 'Создать государство' }}
            </RouterLink>

            <RouterLink v-else to="/login" class="btn btn-primary md:col-span-2">
              Войти, чтобы создать или вступить
            </RouterLink>
          </div>
        </div>
      </section>

      <div v-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <section v-if="myNation" class="surface-card p-5 md:p-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="min-w-0">
            <div class="section-kicker !mb-2">Твоё государство</div>
            <h2 class="truncate text-2xl font-black tracking-tight text-slate-50">
              {{ myNation.title }}
            </h2>
            <p class="mt-3 text-sm leading-7 text-slate-400">
              [{{ myNation.tag }}] · {{ myNation.short_description || 'Короткое описание пока не заполнено.' }}
            </p>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <RouterLink to="/nation/studio" class="btn btn-primary">Открыть управление</RouterLink>
            <RouterLink :to="`/nation/${myNation.slug}`" class="btn btn-outline">Публичная страница</RouterLink>
          </div>
        </div>
      </section>

      <section v-if="topThree.length" class="grid gap-4 lg:grid-cols-3">
        <article
          v-for="(item, index) in topThree"
          :key="item.nation_id || item.slug || item.title"
          class="surface-card p-5 md:p-6"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="section-kicker !mb-2">Топ {{ index + 1 }}</div>
              <h2 class="text-xl font-black tracking-tight text-slate-50">{{ item.title }}</h2>
              <p class="mt-2 text-sm leading-6 text-slate-400">
                [{{ item.tag }}] · score {{ item.score ?? 0 }}
              </p>
            </div>

            <span class="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-black text-slate-100">
              #{{ index + 1 }}
            </span>
          </div>

          <div class="metric-grid metric-grid-2 mt-5">
            <div class="metric-card text-center">
              <p class="metric-value !text-[1.15rem]">{{ item.members_count ?? 0 }}</p>
              <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Участники
              </p>
            </div>
            <div class="metric-card text-center">
              <p class="metric-value !text-[1.15rem]">{{ item.treasury_balance ?? 0 }}</p>
              <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Баланс
              </p>
            </div>
          </div>

          <RouterLink :to="`/nation/${item.slug}`" class="btn btn-outline mt-5 w-full">
            Открыть страницу
          </RouterLink>
        </article>
      </section>

      <div v-if="loading" class="grid gap-4 xl:grid-cols-2">
        <div class="skeleton h-64 rounded-[28px]"></div>
        <div class="skeleton h-64 rounded-[28px]"></div>
        <div class="skeleton h-64 rounded-[28px]"></div>
        <div class="skeleton h-64 rounded-[28px]"></div>
      </div>

      <section v-else-if="!nations.items.length" class="surface-card p-6 md:p-7">
        <div class="max-w-2xl">
          <div class="section-kicker">Пока пусто</div>
          <h2 class="text-2xl font-black tracking-tight text-slate-50">
            Каталог государств пока пуст
          </h2>
          <p class="mt-4 text-sm leading-7 text-slate-400">
            {{ emptyText }}
          </p>
        </div>
      </section>

      <section v-else class="grid gap-4 xl:grid-cols-2">
        <article
          v-for="nation in nations.items"
          :key="nation.id || nation.slug"
          class="surface-card overflow-hidden p-0"
        >
          <div class="relative h-32 overflow-hidden border-b border-white/10 bg-slate-950">
            <img
              v-if="nation.assets?.banner_url || nation.assets?.banner_preview_url"
              :src="nation.assets?.banner_url || nation.assets?.banner_preview_url"
              :alt="nation.title"
              class="h-full w-full object-cover"
            />
            <div v-else class="h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.45),transparent_36%),linear-gradient(135deg,rgba(15,23,42,0.92),rgba(9,14,27,1))]"></div>

            <div class="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/65"></div>
            <div class="absolute left-4 top-4">
              <span class="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200">
                {{ recruitmentLabel(nation.recruitment_policy) }}
              </span>
            </div>
          </div>

          <div class="p-5 md:p-6">
            <div class="-mt-10 flex items-end gap-3">
              <div class="preview-avatar h-16 w-16 border-4 border-[#09101d] bg-[#0f172a] shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
                <img
                  v-if="nation.assets?.icon_url || nation.assets?.icon_preview_url"
                  :src="nation.assets?.icon_url || nation.assets?.icon_preview_url"
                  :alt="nation.title"
                  class="h-full w-full object-cover"
                />
                <span v-else>{{ nation.tag?.slice(0, 2).toUpperCase() }}</span>
              </div>

              <div class="min-w-0 pb-1">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="h-2.5 w-2.5 rounded-full" :style="accentStyle(nation.accent_color)"></span>
                  <span class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">[{{ nation.tag }}]</span>
                </div>
                <h2 class="mt-2 truncate text-xl font-black tracking-tight text-slate-50">
                  {{ nation.title }}
                </h2>
              </div>
            </div>

            <p class="mt-4 text-sm leading-7 text-slate-400">
              {{ nation.short_description || 'Короткое описание пока не добавлено.' }}
            </p>

            <div class="metric-grid metric-grid-2 mt-5">
              <div class="metric-card text-center">
                <p class="metric-value !text-[1.12rem]">{{ nation.stats?.members_count ?? 0 }}</p>
                <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Участники
                </p>
              </div>
              <div class="metric-card text-center">
                <p class="metric-value !text-[1.12rem]">{{ nation.stats?.pending_requests_count ?? 0 }}</p>
                <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Заявки
                </p>
              </div>
            </div>

            <div class="mt-5 flex flex-wrap gap-3">
              <RouterLink :to="`/nation/${nation.slug}`" class="btn btn-primary">
                Открыть
              </RouterLink>

              <RouterLink
                v-if="myNation?.slug === nation.slug"
                to="/nation/studio"
                class="btn btn-outline"
              >
                Управлять
              </RouterLink>
            </div>
          </div>
        </article>
      </section>
    </div>
  </section>
</template>
