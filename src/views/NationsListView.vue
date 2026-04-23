<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getMyNation, getNationsList } from '../services/nationsApi'
import { getNationRankings } from '../services/nationStatsApi'
import { useAuthStore } from '../stores/authStore'
import { formatNumber } from '../utils/formatters'

const auth = useAuthStore()

const loading = ref(true)
const error = ref('')
const search = ref('')
const recruitmentFilter = ref('all')
const sortMode = ref('recommended')
const nations = ref({ total: 0, items: [] })
const myNation = ref(null)
const topThree = ref([])

const emptyText = computed(() => {
  if (!auth.isAuthenticated.value) {
    return 'Войди в аккаунт, чтобы создать своё государство или отправить заявку.'
  }

  return 'Пока государств нет. Можно стать первым и создать своё.'
})

const filteredNations = computed(() => {
  const q = search.value.trim().toLowerCase()
  let items = Array.isArray(nations.value?.items) ? [...nations.value.items] : []

  if (recruitmentFilter.value !== 'all') {
    items = items.filter((item) => item.recruitment_policy === recruitmentFilter.value)
  }

  if (q) {
    items = items.filter((item) => {
      const haystack = [item.title, item.tag, item.slug, item.short_description]
        .map((value) => String(value || '').toLowerCase())
        .join(' ')
      return haystack.includes(q)
    })
  }

  items.sort((a, b) => {
    if (sortMode.value === 'members') {
      return Number(b?.stats?.members_count || 0) - Number(a?.stats?.members_count || 0)
    }

    if (sortMode.value === 'newest') {
      return new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime()
    }

    const weight = (item) => {
      let score = 0
      if (item?.recruitment_policy === 'open') score += 40
      if (item?.recruitment_policy === 'request') score += 20
      if (item?.viewer_request_status === 'pending') score -= 10
      score += Number(item?.stats?.members_count || 0) * 2
      score += Number(item?.stats?.pending_requests_count || 0)
      if (myNation.value?.slug === item?.slug) score += 1000
      return score
    }

    return weight(b) - weight(a)
  })

  return items
})

const summaryCounters = computed(() => {
  const items = Array.isArray(nations.value?.items) ? nations.value.items : []
  return [
    { label: 'Всего', value: items.length },
    { label: 'Свободный вход', value: items.filter((item) => item.recruitment_policy === 'open').length },
    { label: 'По заявке', value: items.filter((item) => item.recruitment_policy === 'request').length },
    { label: 'По приглашению', value: items.filter((item) => item.recruitment_policy === 'invite_only').length },
  ]
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
  if (value === 'open') return 'Свободный вход'
  if (value === 'request') return 'По заявке'
  return 'По приглашению'
}

function accentStyle(value) {
  return {
    backgroundColor: value || '#8b5cf6',
  }
}

function nationActionMeta(nation) {
  if (!auth.isAuthenticated.value) {
    return {
      title: 'Нужен вход',
      description: 'Открой страницу государства и войди в аккаунт, чтобы вступить.',
      button: 'Открыть',
    }
  }

  if (myNation.value?.slug === nation.slug) {
    return {
      title: 'Твоё государство',
      description: 'Можно открыть страницу или перейти в управление.',
      button: 'Открыть',
    }
  }

  if (myNation.value?.slug && myNation.value.slug !== nation.slug) {
    return {
      title: 'Уже есть государство',
      description: `Сейчас ты состоишь в «${myNation.value.title}».`,
      button: 'Открыть',
    }
  }

  if (nation.viewer_request_status === 'pending') {
    return {
      title: 'Заявка уже отправлена',
      description: 'Остаётся дождаться решения лидера.',
      button: 'Открыть',
    }
  }

  if (nation.recruitment_policy === 'invite_only') {
    return {
      title: 'Только по приглашению',
      description: 'Без приглашения вступить не получится.',
      button: 'Открыть',
    }
  }

  if (nation.recruitment_policy === 'open') {
    return {
      title: 'Можно вступить сразу',
      description: 'На странице государства будет доступна прямая кнопка вступления.',
      button: 'Открыть и вступить',
    }
  }

  return {
    title: 'Можно подать заявку',
    description: 'На странице государства можно оставить сообщение лидеру.',
    button: 'Открыть и подать заявку',
  }
}

onMounted(loadPage)
</script>

<template>
  <section class="py-6 md:py-8">
    <div class="container-shell nations-catalog-shell space-y-4">
      <section class="surface-card p-4 md:p-5">
        <div class="grid gap-4 xl:grid-cols-[1.08fr_0.92fr] xl:items-end">
          <div>
            <div class="section-kicker !mb-2">Государства</div>
            <h1 class="text-2xl font-black tracking-tight text-slate-50 md:text-3xl">
              Каталог сообществ
            </h1>
            <p class="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Выбери государство, открой страницу и сразу пойми, можно ли вступить напрямую или нужна заявка.
            </p>
          </div>

          <div class="grid gap-2 sm:grid-cols-2 xl:justify-self-end">
            <RouterLink to="/nations/rankings" class="btn btn-outline">
              Рейтинг
            </RouterLink>

            <RouterLink
              v-if="auth.isAuthenticated.value"
              to="/nation/studio"
              class="btn btn-primary"
            >
              {{ myNation ? 'Моё государство' : 'Создать своё' }}
            </RouterLink>

            <RouterLink v-else to="/login" class="btn btn-primary sm:col-span-2">
              Войти, чтобы вступить
            </RouterLink>
          </div>
        </div>
      </section>

      <div v-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div v-for="item in summaryCounters" :key="item.label" class="metric-card text-center">
          <p class="metric-value !text-[1.15rem]">{{ item.value }}</p>
          <p class="mt-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{{ item.label }}</p>
        </div>
      </section>

      <section v-if="myNation" class="surface-card p-4 md:p-5">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div class="min-w-0">
            <div class="section-kicker !mb-2">Твоё государство</div>
            <h2 class="truncate text-xl font-black tracking-tight text-slate-50">
              {{ myNation.title }}
            </h2>
            <p class="mt-2 text-sm leading-6 text-slate-400">
              [{{ myNation.tag }}] · {{ myNation.short_description || 'Короткое описание пока не заполнено.' }}
            </p>
          </div>

          <div class="grid gap-2 sm:grid-cols-2">
            <RouterLink :to="myNation.viewer_can_manage ? '/nation/studio' : `/nation/${myNation.slug}`" class="btn btn-primary">
              {{ myNation.viewer_can_manage ? 'Управление' : 'Открыть страницу' }}
            </RouterLink>
            <RouterLink :to="`/nation/${myNation.slug}`" class="btn btn-outline">Публичная страница</RouterLink>
          </div>
        </div>
      </section>

      <section v-if="topThree.length" class="grid gap-3 lg:grid-cols-3">
        <article
          v-for="(item, index) in topThree"
          :key="item.nation_id || item.slug || item.title"
          class="surface-card p-4 md:p-5"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="section-kicker !mb-2">Топ {{ index + 1 }}</div>
              <h2 class="truncate text-lg font-black tracking-tight text-slate-50">{{ item.title }}</h2>
              <p class="mt-1.5 text-sm leading-6 text-slate-400">
                [{{ item.tag }}] · score {{ formatNumber(item.score ?? 0) }}
              </p>
            </div>

            <span class="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-black text-slate-100">
              #{{ index + 1 }}
            </span>
          </div>

          <div class="metric-grid metric-grid-2 mt-4">
            <div class="metric-card text-center">
              <p class="metric-value !text-[1.02rem]">{{ formatNumber(item.members_count ?? 0) }}</p>
              <p class="mt-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Участники
              </p>
            </div>
            <div class="metric-card text-center">
              <p class="metric-value !text-[1.02rem]">{{ formatNumber(item.treasury_balance ?? 0) }}</p>
              <p class="mt-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Баланс
              </p>
            </div>
          </div>

          <RouterLink :to="`/nation/${item.slug}`" class="btn btn-outline mt-4 w-full">
            Открыть страницу
          </RouterLink>
        </article>
      </section>

      <section class="surface-card p-4 md:p-5">
        <div class="grid gap-2 lg:grid-cols-[minmax(0,1fr)_200px_200px]">
          <label>
            <span class="field-label">Поиск</span>
            <input v-model="search" class="input" placeholder="Название, тег или описание" />
          </label>

          <label>
            <span class="field-label">Набор</span>
            <select v-model="recruitmentFilter" class="input">
              <option value="all">Все</option>
              <option value="open">Свободный вход</option>
              <option value="request">По заявке</option>
              <option value="invite_only">Только по приглашению</option>
            </select>
          </label>

          <label>
            <span class="field-label">Сортировка</span>
            <select v-model="sortMode" class="input">
              <option value="recommended">Сначала удобные</option>
              <option value="members">По числу участников</option>
              <option value="newest">Сначала новые</option>
            </select>
          </label>
        </div>
      </section>

      <div v-if="loading" class="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
        <div class="skeleton h-[22rem] rounded-[24px]"></div>
        <div class="skeleton h-[22rem] rounded-[24px]"></div>
        <div class="skeleton h-[22rem] rounded-[24px]"></div>
        <div class="skeleton h-[22rem] rounded-[24px]"></div>
      </div>

      <section v-else-if="!nations.items.length" class="surface-card p-5 md:p-6">
        <div class="max-w-2xl">
          <div class="section-kicker">Пока пусто</div>
          <h2 class="text-xl font-black tracking-tight text-slate-50">
            Каталог государств пока пуст
          </h2>
          <p class="mt-3 text-sm leading-6 text-slate-400">
            {{ emptyText }}
          </p>
        </div>
      </section>

      <section v-else-if="!filteredNations.length" class="surface-card p-5 md:p-6">
        <div class="max-w-2xl">
          <div class="section-kicker">Ничего не найдено</div>
          <h2 class="text-xl font-black tracking-tight text-slate-50">
            Фильтр слишком строгий
          </h2>
          <p class="mt-3 text-sm leading-6 text-slate-400">
            Попробуй очистить поиск или сменить тип набора.
          </p>
        </div>
      </section>

      <section v-else class="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
        <article
          v-for="nation in filteredNations"
          :key="nation.id || nation.slug"
          class="surface-card nation-tile overflow-hidden p-0"
        >
          <div class="relative h-20 overflow-hidden border-b border-white/10 bg-slate-950">
            <img
              v-if="nation.assets?.banner_url || nation.assets?.banner_preview_url"
              :src="nation.assets?.banner_url || nation.assets?.banner_preview_url"
              :alt="nation.title"
              class="h-full w-full object-cover"
            />
            <div v-else class="h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.45),transparent_36%),linear-gradient(135deg,rgba(15,23,42,0.92),rgba(9,14,27,1))]"></div>

            <div class="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/70"></div>
            <div class="absolute left-3 top-3 flex flex-wrap gap-1.5">
              <span class="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-200">
                {{ recruitmentLabel(nation.recruitment_policy) }}
              </span>
              <span
                v-if="nation.viewer_request_status === 'pending'"
                class="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200"
              >
                Заявка отправлена
              </span>
            </div>
          </div>

          <div class="p-4">
            <div class="flex items-end gap-3">
              <div class="preview-avatar h-12 w-12 shrink-0 border-2 border-[#09101d] bg-[#0f172a] shadow-[0_12px_30px_rgba(0,0,0,0.3)]">
                <img
                  v-if="nation.assets?.icon_url || nation.assets?.icon_preview_url"
                  :src="nation.assets?.icon_url || nation.assets?.icon_preview_url"
                  :alt="nation.title"
                  class="h-full w-full object-cover"
                />
                <span v-else>{{ nation.tag?.slice(0, 2).toUpperCase() }}</span>
              </div>

              <div class="min-w-0 flex-1 pb-0.5">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="h-2 w-2 rounded-full" :style="accentStyle(nation.accent_color)"></span>
                  <span class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">[{{ nation.tag }}]</span>
                </div>
                <h2 class="mt-1.5 truncate text-base font-black tracking-tight text-slate-50">
                  {{ nation.title }}
                </h2>
              </div>
            </div>

            <p class="mt-3 line-clamp-2 min-h-[2.9rem] text-sm leading-5 text-slate-400">
              {{ nation.short_description || 'Короткое описание пока не добавлено.' }}
            </p>

            <div class="metric-grid metric-grid-3 mt-3.5">
              <div class="metric-card text-center !p-3">
                <p class="metric-value !text-[0.98rem]">{{ formatNumber(nation.stats?.members_count ?? 0) }}</p>
                <p class="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Люди
                </p>
              </div>
              <div class="metric-card text-center !p-3">
                <p class="metric-value !text-[0.98rem]">{{ formatNumber(nation.stats?.pending_requests_count ?? 0) }}</p>
                <p class="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Заявки
                </p>
              </div>
              <div class="metric-card text-center !p-3">
                <p class="metric-value !text-[0.98rem]">{{ formatNumber(nation.stats?.territory_points ?? 0) }}</p>
                <p class="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Земля
                </p>
              </div>
            </div>

            <div class="action-card mt-3.5 !p-3.5">
              <p class="metric-label">{{ nationActionMeta(nation).title }}</p>
              <p class="mt-1.5 text-sm leading-5 text-slate-400">{{ nationActionMeta(nation).description }}</p>
            </div>

            <div class="mt-3.5 grid gap-2">
              <RouterLink :to="`/nation/${nation.slug}`" class="btn btn-primary w-full">
                {{ nationActionMeta(nation).button }}
              </RouterLink>

              <RouterLink
                v-if="myNation?.slug === nation.slug && myNation.viewer_can_manage"
                to="/nation/studio"
                class="btn btn-outline w-full"
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

<style scoped>
.nations-catalog-shell {
  max-width: 1520px;
}

.nation-tile {
  min-height: 100%;
}

@media (min-width: 1536px) {
  .nations-catalog-shell {
    max-width: 1660px;
  }
}
</style>
