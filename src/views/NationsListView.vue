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
  if (value === 'open') return 'Свободное вступление'
  if (value === 'request') return 'По заявке'
  return 'Только по приглашению'
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
      description: 'Войди в аккаунт, чтобы вступить или отправить заявку.',
      actionLabel: 'Войти',
      actionTo: '/login',
      showAction: true,
    }
  }

  if (myNation.value?.slug === nation.slug) {
    return {
      title: 'Твоё государство',
      description: 'Можно открыть страницу или сразу перейти в управление.',
      actionLabel: myNation.value.viewer_can_manage ? 'Управлять' : 'Открыть',
      actionTo: myNation.value.viewer_can_manage ? '/nation/studio' : `/nation/${nation.slug}`,
      showAction: true,
    }
  }

  if (myNation.value?.slug && myNation.value.slug !== nation.slug) {
    return {
      title: 'Уже есть государство',
      description: `Сейчас ты состоишь в «${myNation.value.title}».`,
      actionLabel: 'Моё государство',
      actionTo: myNation.value.viewer_can_manage ? '/nation/studio' : `/nation/${myNation.value.slug}`,
      showAction: true,
    }
  }

  if (nation.viewer_request_status === 'pending') {
    return {
      title: 'Заявка отправлена',
      description: 'Повторно отправлять ничего не нужно — осталось дождаться решения.',
      actionLabel: 'Открыть',
      actionTo: `/nation/${nation.slug}`,
      showAction: true,
    }
  }

  if (nation.recruitment_policy === 'invite_only') {
    return {
      title: 'Только по приглашению',
      description: 'Вступление возможно только после приглашения от лидера или офицера.',
      actionLabel: '',
      actionTo: '',
      showAction: false,
    }
  }

  if (nation.recruitment_policy === 'open') {
    return {
      title: 'Можно вступить сразу',
      description: 'На странице государства доступна прямая кнопка вступления.',
      actionLabel: 'Вступить',
      actionTo: `/nation/${nation.slug}`,
      showAction: true,
    }
  }

  return {
    title: 'Можно подать заявку',
    description: 'На странице государства можно отправить сообщение лидеру и дождаться ответа.',
    actionLabel: 'Подать заявку',
    actionTo: `/nation/${nation.slug}`,
    showAction: true,
  }
}

onMounted(loadPage)
</script>

<template>
  <section class="py-5 md:py-6">
    <div class="container-shell max-w-[1380px] space-y-4">
      <section class="surface-card p-4 md:p-5">
        <div class="grid gap-5 xl:grid-cols-[1.06fr_0.94fr] xl:items-end">
          <div>
            <div class="section-kicker !mb-2">Государства</div>
            <h1 class="text-2xl font-black tracking-tight text-slate-50 md:text-3xl">
              Каталог сообществ
            </h1>
            <p class="mt-3 max-w-3xl text-sm leading-6 text-slate-400 md:text-[14px]">
              Здесь легко понять, куда можно вступить сразу, куда нужна заявка и где набор идёт только по приглашению.
            </p>
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
              {{ myNation ? 'Моё государство' : 'Создать государство' }}
            </RouterLink>

            <RouterLink v-else to="/login" class="btn btn-primary md:col-span-2">
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
          <p class="metric-value !text-[1.3rem]">{{ item.value }}</p>
          <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{{ item.label }}</p>
        </div>
      </section>

      <section v-if="myNation" class="surface-card p-4 md:p-5">
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
            <RouterLink :to="myNation.viewer_can_manage ? '/nation/studio' : `/nation/${myNation.slug}`" class="btn btn-primary">
              {{ myNation.viewer_can_manage ? 'Открыть управление' : 'Открыть страницу' }}
            </RouterLink>
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
                [{{ item.tag }}] · score {{ formatNumber(item.score ?? 0) }}
              </p>
            </div>

            <span class="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-black text-slate-100">
              #{{ index + 1 }}
            </span>
          </div>

          <div class="metric-grid metric-grid-2 mt-5">
            <div class="metric-card text-center">
              <p class="metric-value !text-[1.15rem]">{{ formatNumber(item.members_count ?? 0) }}</p>
              <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Участники
              </p>
            </div>
            <div class="metric-card text-center">
              <p class="metric-value !text-[1.15rem]">{{ formatNumber(item.treasury_balance ?? 0) }}</p>
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

      <section class="surface-card p-5 md:p-6">
        <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
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

      <div v-if="loading" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <div class="skeleton h-[390px] rounded-[24px]"></div>
        <div class="skeleton h-[390px] rounded-[24px]"></div>
        <div class="skeleton h-[390px] rounded-[24px]"></div>
        <div class="skeleton h-[390px] rounded-[24px]"></div>
      </div>

      <section v-else-if="!nations.items.length" class="surface-card p-6 md:p-7">
        <div class="max-w-2xl">
          <div class="section-kicker">Пока пусто</div>
          <h2 class="text-2xl font-black tracking-tight text-slate-50">
            Каталог государств пока пуст
          </h2>
          <p class="mt-3 text-sm leading-6 text-slate-400">
            {{ emptyText }}
          </p>
        </div>
      </section>

      <section v-else-if="!filteredNations.length" class="surface-card p-6 md:p-7">
        <div class="max-w-2xl">
          <div class="section-kicker">Ничего не найдено</div>
          <h2 class="text-2xl font-black tracking-tight text-slate-50">
            Фильтр слишком строгий
          </h2>
          <p class="mt-3 text-sm leading-6 text-slate-400">
            Попробуй очистить поиск или сменить тип набора.
          </p>
        </div>
      </section>

      <section v-else class="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <article
          v-for="nation in filteredNations"
          :key="nation.id || nation.slug"
          class="surface-card nation-card"
        >
          <div class="nation-card__banner">
            <img
              v-if="nation.assets?.banner_url || nation.assets?.banner_preview_url"
              :src="nation.assets?.banner_url || nation.assets?.banner_preview_url"
              :alt="nation.title"
              class="h-full w-full object-cover"
            />
            <div
              v-else
              class="h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.45),transparent_36%),linear-gradient(135deg,rgba(15,23,42,0.92),rgba(9,14,27,1))]"
            ></div>

            <div class="nation-card__overlay"></div>

            <div class="nation-card__badges">
              <span class="nation-card__badge">
                {{ recruitmentLabel(nation.recruitment_policy) }}
              </span>
              <span
                v-if="nation.viewer_request_status === 'pending'"
                class="nation-card__badge nation-card__badge--warning"
              >
                Заявка отправлена
              </span>
            </div>
          </div>

          <div class="nation-card__body">
            <div class="nation-card__head">
              <div class="preview-avatar nation-card__avatar">
                <img
                  v-if="nation.assets?.icon_url || nation.assets?.icon_preview_url"
                  :src="nation.assets?.icon_url || nation.assets?.icon_preview_url"
                  :alt="nation.title"
                  class="h-full w-full object-cover"
                />
                <span v-else>{{ nation.tag?.slice(0, 2).toUpperCase() }}</span>
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex min-w-0 items-center gap-2">
                  <span class="nation-card__accent" :style="accentStyle(nation.accent_color)"></span>
                  <span class="truncate text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    [{{ nation.tag }}]
                  </span>
                </div>

                <h2 class="nation-card__title">
                  {{ nation.title }}
                </h2>
              </div>
            </div>

            <p class="nation-card__description">
              {{ nation.short_description || 'Короткое описание пока не добавлено.' }}
            </p>

            <div class="nation-card__stats">
              <div class="nation-card__stat metric-card text-center">
                <p class="metric-value !text-[1rem]">{{ formatNumber(nation.stats?.members_count ?? 0) }}</p>
                <p class="nation-card__stat-label">Участники</p>
              </div>

              <div class="nation-card__stat metric-card text-center">
                <p class="metric-value !text-[1rem]">{{ formatNumber(nation.stats?.pending_requests_count ?? 0) }}</p>
                <p class="nation-card__stat-label">Заявки</p>
              </div>

              <div class="nation-card__stat metric-card text-center">
                <p class="metric-value !text-[1rem]">{{ formatNumber(nation.stats?.territory_points ?? 0) }}</p>
                <p class="nation-card__stat-label">Территории</p>
              </div>
            </div>

            <div class="nation-card__info action-card">
              <p class="metric-label">{{ nationActionMeta(nation).title }}</p>
              <p class="nation-card__info-text">
                {{ nationActionMeta(nation).description }}
              </p>
            </div>

            <div class="nation-card__actions">
              <RouterLink :to="`/nation/${nation.slug}`" class="btn btn-primary nation-card__button">
                Страница государства
              </RouterLink>

              <RouterLink
                v-if="nationActionMeta(nation).showAction"
                :to="nationActionMeta(nation).actionTo"
                class="btn btn-outline nation-card__button"
              >
                {{ nationActionMeta(nation).actionLabel }}
              </RouterLink>
            </div>
          </div>
        </article>
      </section>
    </div>
  </section>
</template>

<style scoped>
.nation-card {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-height: 100%;
  overflow: hidden;
  padding: 0 !important;
}

.nation-card__banner {
  position: relative;
  height: 96px;
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: #020817;
}

.nation-card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.5));
}

.nation-card__badges {
  position: absolute;
  inset: 12px 12px auto 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.nation-card__badge {
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.34);
  padding: 0.34rem 0.65rem;
  font-size: 9px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgb(226 232 240);
}

.nation-card__badge--warning {
  border-color: rgba(251, 191, 36, 0.2);
  background: rgba(251, 191, 36, 0.1);
  color: rgb(253 230 138);
}

.nation-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.9rem;
  padding: 16px;
}

.nation-card__head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nation-card__avatar {
  height: 52px;
  width: 52px;
  flex-shrink: 0;
  border: 2px solid #09101d;
  background: #0f172a;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);
}

.nation-card__accent {
  height: 9px;
  width: 9px;
  flex-shrink: 0;
  border-radius: 999px;
}

.nation-card__title {
  margin-top: 5px;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: 1.08rem;
  font-weight: 900;
  line-height: 1.22;
  letter-spacing: -0.02em;
  color: rgb(248 250 252);
}

.nation-card__description {
  min-height: 46px;
  color: rgb(148 163 184);
  font-size: 0.91rem;
  line-height: 1.55;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.nation-card__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.nation-card__stat {
  min-width: 0;
  border-radius: 1rem !important;
  padding: 0.7rem 0.45rem !important;
}

.nation-card__stat-label {
  margin-top: 6px;
  min-height: 22px;
  font-size: 9px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: rgb(100 116 139);
  white-space: normal;
}

.nation-card__info {
  min-height: 92px;
  border-radius: 1.1rem !important;
  padding: 0.85rem !important;
}

.nation-card__info-text {
  margin-top: 8px;
  color: rgb(148 163 184);
  font-size: 0.88rem;
  line-height: 1.55;
}

.nation-card__actions {
  margin-top: auto;
  display: grid;
  gap: 8px;
}

.nation-card__button {
  width: 100%;
  justify-content: center;
}

@media (max-width: 460px) {
  .nation-card__stats {
    grid-template-columns: 1fr;
  }

  .nation-card__info {
    min-height: 0;
  }
}

@media (min-width: 1536px) {
  .nation-card__body {
    padding: 15px;
  }

  .nation-card__title {
    font-size: 1.02rem;
  }

  .nation-card__description,
  .nation-card__info-text {
    font-size: 0.86rem;
  }
}
</style>
