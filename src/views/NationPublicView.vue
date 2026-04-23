<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import NationActivityFeed from '../features/nations/components/NationActivityFeed.vue'
import {
  approveNationRequest,
  getMyNation,
  getNationBySlug,
  joinNation,
  rejectNationRequest,
} from '../services/nationsApi'
import { getNationActivity } from '../services/nationActivityApi'
import { getNationStatsBySlug, getNationTopDonors, getNationTreasuryTransactions } from '../services/nationStatsApi'
import { useAuthStore } from '../stores/authStore'
import { formatCompactHoursFromMinutes, formatNumber, formatRoleLabel, formatRecruitmentLabel } from '../utils/formatters'

const route = useRoute()
const auth = useAuthStore()

const loading = ref(true)
const statsLoading = ref(true)
const activityLoading = ref(true)
const treasuryLoading = ref(true)
const donorsLoading = ref(true)
const currentNationLoading = ref(false)

const error = ref('')
const actionMessage = ref('')
const joinLoading = ref(false)
const requestMessage = ref('')

const nation = ref(null)
const currentNation = ref(null)
const stats = ref(null)
const activity = ref([])
const transactions = ref([])
const donors = ref([])

function hexToRgba(hex, alpha) {
  if (!hex || typeof hex !== 'string') return `rgba(109, 93, 246, ${alpha})`
  const value = hex.replace('#', '')
  const normalized = value.length === 3 ? value.split('').map((item) => item + item).join('') : value
  if (normalized.length !== 6) return `rgba(109, 93, 246, ${alpha})`
  const intValue = Number.parseInt(normalized, 16)
  const r = (intValue >> 16) & 255
  const g = (intValue >> 8) & 255
  const b = intValue & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function formatAllianceType(value) {
  switch (String(value || '').toLowerCase()) {
    case 'nato':
      return 'Военный блок'
    case 'economic':
      return 'Экономический союз'
    case 'un':
      return 'Политический союз'
    default:
      return 'Альянс'
  }
}

function txLabel(item) {
  const type = String(item?.transaction_type || '').toLowerCase()
  if (type === 'player_donation') return `Донат игрока ${item?.metadata_json?.minecraft_nickname || ''}`.trim()
  if (type === 'deposit') return 'Пополнение'
  if (type === 'withdraw') return 'Списание'
  if (type === 'alliance_transfer_out') return 'Перевод союзнику'
  if (type === 'alliance_transfer_in') return 'Перевод от союзника'
  if (type === 'alliance_fee_income') return 'Комиссия альянса'
  return item?.transaction_type || 'Операция'
}

const accent = computed(() => nation.value?.accent_color || '#6d5df6')
const iconUrl = computed(() => nation.value?.assets?.icon_url || nation.value?.assets?.icon_preview_url || '')
const bannerUrl = computed(() => nation.value?.assets?.banner_url || nation.value?.assets?.banner_preview_url || '')
const backgroundUrl = computed(() => nation.value?.assets?.background_url || nation.value?.assets?.background_preview_url || '')
const tagText = computed(() => nation.value?.tag || 'TAG')
const allianceSummary = computed(() => nation.value?.alliance_summary || null)

const allianceMembersPreview = computed(() => {
  const members = Array.isArray(allianceSummary.value?.members) ? allianceSummary.value.members : []
  return members.filter((item) => item.slug !== nation.value?.slug).slice(0, 6)
})

const routeBackground = computed(() => {
  const accentGlow = hexToRgba(accent.value, 0.22)
  if (!backgroundUrl.value) {
    return [
      `radial-gradient(circle at top left, ${accentGlow} 0%, transparent 24%)`,
      `radial-gradient(circle at top right, ${hexToRgba(accent.value, 0.16)} 0%, transparent 28%)`,
      'linear-gradient(180deg, #05070f 0%, #0a0f1c 48%, #10192c 100%)',
    ].join(', ')
  }
  return [
    'linear-gradient(180deg, rgba(4,6,11,0.62), rgba(4,6,11,0.9))',
    `radial-gradient(circle at top left, ${accentGlow} 0%, transparent 28%)`,
    `url(${backgroundUrl.value})`,
  ].join(', ')
})

const pageShellStyle = computed(() => ({
  borderColor: hexToRgba(accent.value, 0.2),
  boxShadow: `0 28px 80px ${hexToRgba(accent.value, 0.16)}`,
  background: 'linear-gradient(180deg, rgba(7,11,20,0.48), rgba(7,11,20,0.32))',
}))

const heroStyle = computed(() => {
  if (bannerUrl.value) {
    return {
      backgroundImage: [
        'linear-gradient(180deg, rgba(4,6,11,0.05), rgba(4,6,11,0.74))',
        `radial-gradient(circle at top left, ${hexToRgba(accent.value, 0.28)} 0%, transparent 32%)`,
        `url(${bannerUrl.value})`,
      ].join(', '),
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }
  return {
    background: [
      `radial-gradient(circle at top left, ${hexToRgba(accent.value, 0.36)} 0%, transparent 32%)`,
      'linear-gradient(135deg, rgba(6,9,19,0.96) 0%, rgba(10,15,27,0.98) 56%, rgba(22,28,48,1) 100%)',
    ].join(', '),
  }
})

const cardStyle = computed(() => ({
  borderColor: hexToRgba(accent.value, 0.16),
  background: `linear-gradient(180deg, rgba(10,15,27,0.84), ${hexToRgba(accent.value, 0.08)})`,
}))

const isAuthenticated = computed(() => auth.isAuthenticated.value)
const viewerHasPendingRequest = computed(() => nation.value?.viewer_request_status === 'pending')
const viewerIsMember = computed(() => Boolean(nation.value?.viewer_is_member))
const viewerCanManage = computed(() => Boolean(nation.value?.viewer_can_manage))
const viewerOwnsOtherNation = computed(() => {
  if (!currentNation.value?.slug || !nation.value?.slug) return false
  return currentNation.value.slug !== nation.value.slug
})

const canJoinDirectly = computed(() => {
  if (!nation.value || !isAuthenticated.value) return false
  if (viewerCanManage.value || viewerIsMember.value || viewerHasPendingRequest.value || viewerOwnsOtherNation.value) return false
  return nation.value.recruitment_policy === 'open'
})

const canRequestJoin = computed(() => {
  if (!nation.value || !isAuthenticated.value) return false
  if (viewerCanManage.value || viewerIsMember.value || viewerHasPendingRequest.value || viewerOwnsOtherNation.value) return false
  return nation.value.recruitment_policy === 'request'
})

const canShowJoinAction = computed(() => canJoinDirectly.value || canRequestJoin.value)

const actionCardTitle = computed(() => {
  if (!isAuthenticated.value) return 'Войти для вступления'
  if (viewerCanManage.value) return 'Это твоё государство'
  if (viewerIsMember.value) return 'Ты уже состоишь здесь'
  if (viewerOwnsOtherNation.value) return 'Сначала покинь текущее государство'
  if (viewerHasPendingRequest.value) return 'Заявка уже отправлена'
  if (nation.value?.recruitment_policy === 'invite_only') return 'Вступление только по приглашению'
  if (canJoinDirectly.value) return 'Можно вступить сразу'
  if (canRequestJoin.value) return 'Можно подать заявку'
  return 'Действия'
})

const actionCardText = computed(() => {
  if (!nation.value) return ''
  if (!isAuthenticated.value) return 'После входа ты сможешь сразу вступить или отправить заявку без лишних шагов.'
  if (viewerCanManage.value) return 'Ты можешь редактировать страницу, принимать заявки и управлять участниками.'
  if (viewerIsMember.value) return 'Ты уже находишься в составе этого государства.'
  if (viewerOwnsOtherNation.value) {
    return `Сейчас ты состоишь в «${currentNation.value?.title || 'другом государстве'}». Одновременно можно быть только в одном.`
  }
  if (viewerHasPendingRequest.value) return 'Лидеры ещё не приняли решение. Повторно отправлять заявку не нужно.'
  if (nation.value.recruitment_policy === 'invite_only') return 'Это государство принимает игроков только по прямому приглашению от лидера или офицеров.'
  if (canJoinDirectly.value) return 'У этого государства открытый набор. Вступление произойдёт сразу после нажатия кнопки.'
  if (canRequestJoin.value) return 'Оставь короткое сообщение, чтобы лидер понял, зачем ты хочешь присоединиться.'
  return 'Доступных действий сейчас нет.'
})

function applyRouteBackground(value) {
  document.documentElement.style.setProperty('--route-bg', value)
}

async function loadNation() {
  loading.value = true
  error.value = ''
  actionMessage.value = ''
  try {
    nation.value = await getNationBySlug(route.params.slug, auth.accessToken || null)
  } catch (err) {
    error.value = err.message || 'Не удалось загрузить страницу государства.'
  } finally {
    loading.value = false
  }
}

async function loadCurrentNation() {
  if (!auth.accessToken) {
    currentNation.value = null
    return
  }

  currentNationLoading.value = true
  try {
    currentNation.value = await getMyNation(auth.accessToken)
  } catch {
    currentNation.value = null
  } finally {
    currentNationLoading.value = false
  }
}

async function loadStats() {
  statsLoading.value = true
  try {
    stats.value = await getNationStatsBySlug(route.params.slug, auth.accessToken || null)
  } catch {
    stats.value = null
  } finally {
    statsLoading.value = false
  }
}

async function loadActivity() {
  activityLoading.value = true
  try {
    const payload = await getNationActivity(route.params.slug, auth.accessToken || null)
    activity.value = Array.isArray(payload?.items) ? payload.items : []
  } catch {
    activity.value = []
  } finally {
    activityLoading.value = false
  }
}

async function loadTreasury() {
  treasuryLoading.value = true
  try {
    const payload = await getNationTreasuryTransactions(route.params.slug, auth.accessToken || null)
    transactions.value = payload?.items || []
  } catch {
    transactions.value = []
  } finally {
    treasuryLoading.value = false
  }
}

async function loadDonors() {
  donorsLoading.value = true
  try {
    const payload = await getNationTopDonors(route.params.slug, auth.accessToken || null)
    donors.value = payload?.items || []
  } catch {
    donors.value = []
  } finally {
    donorsLoading.value = false
  }
}

async function handleJoin() {
  if (!nation.value || !auth.accessToken || !canShowJoinAction.value) return

  joinLoading.value = true
  error.value = ''
  actionMessage.value = ''

  try {
    const response = await joinNation(auth.accessToken, nation.value.slug, {
      message: canRequestJoin.value ? requestMessage.value || null : null,
    })

    nation.value = response?.nation || nation.value
    actionMessage.value =
      canJoinDirectly.value
        ? 'Ты успешно вступил в государство.'
        : 'Заявка отправлена. Теперь нужно дождаться решения лидера.'
    requestMessage.value = ''

    await Promise.all([loadActivity(), loadCurrentNation()])
  } catch (err) {
    error.value = err.message || 'Не удалось выполнить действие.'
  } finally {
    joinLoading.value = false
  }
}

async function handleApprove(requestId) {
  try {
    nation.value = await approveNationRequest(auth.accessToken, nation.value.slug, requestId)
    actionMessage.value = 'Заявка одобрена.'
    await loadActivity()
  } catch (err) {
    error.value = err.message || 'Не удалось одобрить заявку.'
  }
}

async function handleReject(requestId) {
  try {
    nation.value = await rejectNationRequest(auth.accessToken, nation.value.slug, requestId)
    actionMessage.value = 'Заявка отклонена.'
    await loadActivity()
  } catch (err) {
    error.value = err.message || 'Не удалось отклонить заявку.'
  }
}

async function loadPage() {
  await Promise.all([
    loadNation(),
    loadCurrentNation(),
    loadStats(),
    loadActivity(),
    loadTreasury(),
    loadDonors(),
  ])
}

watch(() => route.params.slug, loadPage)
watch(routeBackground, (value) => applyRouteBackground(value), { immediate: true })

onMounted(loadPage)

onBeforeUnmount(() => {
  document.documentElement.style.removeProperty('--route-bg')
})
</script>

<template>
  <section class="py-4 md:py-5">
    <div class="container-shell max-w-[1380px]">
      <div v-if="loading" class="space-y-2.5">
        <div class="skeleton h-[220px] rounded-[24px]"></div>
        <div class="grid gap-3 xl:grid-cols-[minmax(0,1.12fr)_320px]">
          <div class="skeleton h-[220px] rounded-[24px]"></div>
          <div class="skeleton h-[220px] rounded-[24px]"></div>
        </div>
      </div>

      <div v-else-if="error" class="mx-auto max-w-3xl alert alert-error">{{ error }}</div>

      <div v-else-if="nation" class="page-backdrop route-shell overflow-hidden rounded-[26px] border" :style="pageShellStyle">
        <div class="p-2.5 md:p-3">
          <div class="space-y-2.5">
            <section class="relative overflow-hidden rounded-[24px] shadow-[0_20px_72px_rgba(0,0,0,0.32)]" :style="heroStyle">
              <div class="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/72"></div>
              <div class="relative px-4 pb-4 pt-4 md:px-5 md:pb-5 md:pt-5">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="rounded-full border border-white/12 bg-black/30 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/84 backdrop-blur-md">
                    Государство
                  </span>
                  <span class="rounded-full border border-white/12 bg-black/30 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/84 backdrop-blur-md">
                    {{ formatRecruitmentLabel(nation.recruitment_policy) }}
                  </span>
                  <span
                    v-if="viewerHasPendingRequest"
                    class="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-200 backdrop-blur-md"
                  >
                    Заявка отправлена
                  </span>
                  <span
                    v-if="allianceSummary"
                    class="rounded-full border border-white/12 bg-black/30 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/84 backdrop-blur-md"
                  >
                    Альянс: {{ allianceSummary.tag }}
                  </span>
                </div>

                <div class="mt-7 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                  <div class="flex min-w-0 items-end gap-4">
                    <div class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[18px] border-2 border-white/90 bg-slate-900 text-2xl font-black uppercase text-slate-100 shadow-[0_12px_30px_rgba(0,0,0,0.34)] md:h-20 md:w-20">
                      <img v-if="iconUrl" :src="iconUrl" alt="icon" class="h-full w-full object-cover" />
                      <span v-else>{{ tagText.slice(0, 2).toUpperCase() }}</span>
                    </div>

                    <div class="min-w-0 pb-1 text-white">
                      <h1 class="break-words text-2xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] md:text-3xl">
                        {{ nation.title }}
                      </h1>
                      <p class="mt-1.5 text-sm text-white/76 md:text-[15px]">
                        [{{ nation.tag }}] · {{ nation.short_description || 'Описание пока не добавлено' }}
                      </p>
                    </div>
                  </div>

                  <div class="flex flex-wrap gap-3">
                    <RouterLink v-if="viewerCanManage" to="/nation/studio" class="btn btn-light rounded-2xl">
                      Управлять
                    </RouterLink>
                    <RouterLink to="/nations" class="btn btn-outline rounded-2xl border-white/18 bg-black/10 text-white hover:border-white/30 hover:bg-black/20">
                      Все государства
                    </RouterLink>
                  </div>
                </div>
              </div>
            </section>

            <div v-if="actionMessage" class="alert alert-success">{{ actionMessage }}</div>

            <div class="grid gap-3 xl:grid-cols-[minmax(0,1.12fr)_320px]">
              <div class="space-y-4">
                <section class="surface-card p-3.5 md:p-4" :style="cardStyle">
                  <div class="section-kicker !mb-2">О государстве</div>
                  <h2 class="text-base font-black text-slate-50 md:text-lg">Описание</h2>
                  <p class="mt-2.5 whitespace-pre-line text-sm leading-6 text-slate-300 md:text-[14px]">
                    {{ nation.description || 'Подробное описание пока не заполнено.' }}
                  </p>
                </section>

                <section class="surface-card p-3.5 md:p-4" :style="cardStyle">
                  <div class="section-kicker !mb-2">Участники</div>
                  <div class="flex items-center justify-between gap-3">
                    <h2 class="text-base font-black text-slate-50 md:text-lg">Состав государства</h2>
                    <span class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {{ nation.members.length }} участников
                    </span>
                  </div>

                  <div class="mt-3 grid gap-2.5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    <div v-for="member in nation.members" :key="member.user_id" class="action-card !p-3" :style="cardStyle">
                      <p class="font-semibold text-slate-100">{{ member.minecraft_nickname || member.site_login }}</p>
                      <p class="mt-1 text-sm text-slate-400">@{{ member.site_login }}</p>
                      <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                        {{ formatRoleLabel(member.role) }}
                      </p>
                    </div>
                  </div>
                </section>

                <NationActivityFeed
                  :items="activity"
                  :loading="activityLoading"
                  title="Последняя активность"
                  subtitle="Короткая лента последних событий государства."
                  compact
                />
              </div>

              <aside class="space-y-4">
                <section class="surface-card p-3.5 md:p-4" :style="cardStyle">
                  <div class="section-kicker !mb-2">Вступление</div>
                  <h2 class="text-lg font-black text-slate-50">{{ actionCardTitle }}</h2>
                  <p class="mt-3 text-sm leading-6 text-slate-300">
                    {{ actionCardText }}
                  </p>

                  <div v-if="!isAuthenticated" class="mt-3 grid gap-2.5">
                    <RouterLink :to="`/login?redirect=${encodeURIComponent(`/nation/${nation.slug}`)}`" class="btn btn-primary w-full">
                      Войти и продолжить
                    </RouterLink>
                    <RouterLink to="/register" class="btn btn-outline w-full">
                      Создать аккаунт
                    </RouterLink>
                  </div>

                  <div v-else-if="viewerOwnsOtherNation" class="action-card mt-4" :style="cardStyle">
                    <p class="metric-label">Текущее государство</p>
                    <p class="mt-2 text-sm font-semibold text-slate-100">
                      {{ currentNation?.title || 'Уже выбрано другое государство' }}
                    </p>
                    <div class="mt-3 grid gap-3">
                      <RouterLink to="/nation/studio" class="btn btn-outline w-full">
                        Открыть своё государство
                      </RouterLink>
                      <RouterLink to="/nations" class="btn btn-ghost w-full">
                        Вернуться к каталогу
                      </RouterLink>
                    </div>
                  </div>

                  <div v-else-if="viewerHasPendingRequest" class="action-card mt-4" :style="cardStyle">
                    <p class="metric-label">Статус</p>
                    <p class="mt-2 text-sm font-semibold text-amber-200">Ожидает решения лидера</p>
                  </div>

                  <div v-else-if="viewerIsMember" class="action-card mt-4" :style="cardStyle">
                    <p class="metric-label">Статус</p>
                    <p class="mt-2 text-sm font-semibold text-emerald-200">Ты уже в составе государства</p>
                  </div>

                  <div v-else-if="canRequestJoin" class="mt-3 space-y-2.5">
                    <div class="action-card" :style="cardStyle">
                      <p class="metric-label">Сообщение лидеру</p>
                      <textarea
                        v-model="requestMessage"
                        rows="4"
                        class="textarea textarea-bordered mt-3 w-full rounded-2xl"
                        placeholder="Коротко напиши, почему хочешь вступить"
                      ></textarea>
                    </div>
                    <button type="button" class="btn btn-primary w-full" :disabled="joinLoading || currentNationLoading" @click="handleJoin">
                      <span v-if="joinLoading" class="spinner"></span>
                      <span>{{ joinLoading ? 'Отправляем...' : 'Подать заявку' }}</span>
                    </button>
                  </div>

                  <button
                    v-else-if="canJoinDirectly"
                    type="button"
                    class="btn btn-primary mt-3 w-full"
                    :disabled="joinLoading || currentNationLoading"
                    @click="handleJoin"
                  >
                    <span v-if="joinLoading" class="spinner"></span>
                    <span>{{ joinLoading ? 'Вступаем...' : 'Вступить в государство' }}</span>
                  </button>

                  <div v-else-if="nation.recruitment_policy === 'invite_only'" class="action-card mt-4" :style="cardStyle">
                    <p class="metric-label">Набор</p>
                    <p class="mt-2 text-sm font-semibold text-slate-100">Только по приглашению</p>
                  </div>
                </section>

                <section class="surface-card p-3.5 md:p-4" :style="cardStyle">
                  <div class="section-kicker !mb-2">Статистика</div>
                  <h2 class="text-lg font-black text-slate-50">Сила государства</h2>

                  <div v-if="statsLoading" class="mt-3 space-y-2.5">
                    <div class="skeleton h-16 rounded-2xl"></div>
                    <div class="skeleton h-16 rounded-2xl"></div>
                  </div>

                  <div v-else class="metric-grid metric-grid-2 mt-3">
                    <div class="metric-card text-center">
                      <p class="metric-value !text-[1.05rem]">{{ formatNumber(stats?.treasury_balance ?? 0) }}</p>
                      <p class="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Баланс</p>
                    </div>
                    <div class="metric-card text-center">
                      <p class="metric-value !text-[1.05rem]">{{ formatNumber(stats?.territory_points ?? 0) }}</p>
                      <p class="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Территория</p>
                    </div>
                    <div class="metric-card text-center">
                      <p class="metric-value !text-[1.05rem]">{{ formatCompactHoursFromMinutes(stats?.total_playtime_minutes ?? 0) }}</p>
                      <p class="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Онлайн</p>
                    </div>
                    <div class="metric-card text-center">
                      <p class="metric-value !text-[1.05rem]">{{ formatNumber(stats?.prestige_score ?? 0) }}</p>
                      <p class="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Престиж</p>
                    </div>
                  </div>

                  <RouterLink to="/nations/rankings" class="btn btn-outline mt-4 w-full rounded-2xl">
                    Открыть рейтинг
                  </RouterLink>
                </section>

                <section class="surface-card p-3.5 md:p-4" :style="cardStyle">
                  <div class="section-kicker !mb-2">Альянс</div>
                  <h2 class="text-lg font-black text-slate-50">
                    {{ allianceSummary ? allianceSummary.title : 'Надгосударственный блок' }}
                  </h2>

                  <div v-if="!allianceSummary" class="action-card mt-4 text-sm text-slate-400" :style="cardStyle">
                    Это государство пока не состоит ни в одном альянсе.
                  </div>

                  <div v-else class="mt-3 space-y-3">
                    <div class="action-card" :style="cardStyle">
                      <p class="font-semibold text-slate-100">[{{ allianceSummary.tag }}] · {{ formatAllianceType(allianceSummary.alliance_type) }}</p>
                      <p class="mt-2 text-sm leading-6 text-slate-400">
                        {{ allianceSummary.description || 'Описание альянса пока не добавлено.' }}
                      </p>
                    </div>

                    <div class="grid gap-2.5 sm:grid-cols-2">
                      <div class="metric-card text-center">
                        <p class="metric-value !text-[1.02rem]">{{ allianceSummary.members_count }}</p>
                        <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Государств</p>
                      </div>
                      <div class="metric-card text-center">
                        <p class="metric-value !text-[1.02rem]">{{ formatNumber(allianceSummary.treasury_balance ?? 0) }}</p>
                        <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Казна</p>
                      </div>
                    </div>

                    <div v-if="allianceMembersPreview.length">
                      <div class="section-kicker !mb-2">Союзники</div>
                      <div class="grid gap-3">
                        <RouterLink
                          v-for="member in allianceMembersPreview"
                          :key="member.nation_id"
                          :to="`/nation/${member.slug}`"
                          class="action-card transition hover:-translate-y-[1px]"
                          :style="cardStyle"
                        >
                          <div class="flex items-center gap-3">
                            <div class="preview-avatar h-11 w-11 border border-white/10 text-sm">
                              <img
                                v-if="member.icon_url || member.icon_preview_url"
                                :src="member.icon_url || member.icon_preview_url"
                                :alt="member.title"
                                class="h-full w-full object-cover"
                              />
                              <span v-else>{{ member.tag?.slice(0, 2).toUpperCase() }}</span>
                            </div>
                            <div class="min-w-0">
                              <p class="truncate font-semibold text-slate-100">{{ member.title }}</p>
                              <p class="mt-1 text-sm text-slate-400">[{{ member.tag }}]</p>
                            </div>
                          </div>
                        </RouterLink>
                      </div>
                    </div>

                    <RouterLink to="/alliances" class="btn btn-outline w-full rounded-2xl">
                      Открыть центр альянсов
                    </RouterLink>
                  </div>
                </section>

                <section v-if="nation.viewer_can_manage" class="surface-card p-3.5 md:p-4" :style="cardStyle">
                  <div class="section-kicker !mb-2">Заявки</div>
                  <h2 class="text-lg font-black text-slate-50">Управление вступлением</h2>

                  <div v-if="!nation.join_requests.length" class="action-card mt-4 text-sm text-slate-400" :style="cardStyle">
                    Сейчас нет активных заявок.
                  </div>

                  <div v-else class="mt-3 space-y-2.5">
                    <div v-for="item in nation.join_requests" :key="item.id" class="action-card" :style="cardStyle">
                      <div class="flex flex-wrap items-start justify-between gap-3">
                        <div class="min-w-0">
                          <p class="font-semibold text-slate-100">{{ item.minecraft_nickname || item.site_login }}</p>
                          <p class="mt-1 text-sm text-slate-400">@{{ item.site_login }}</p>
                          <p v-if="item.message" class="mt-3 text-sm leading-6 text-slate-300">{{ item.message }}</p>
                        </div>
                        <div class="flex flex-wrap gap-2">
                          <button type="button" class="btn btn-outline btn-sm" @click="handleReject(item.id)">Отклонить</button>
                          <button type="button" class="btn btn-primary btn-sm" @click="handleApprove(item.id)">Принять</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </aside>
            </div>

            <div class="grid gap-3 xl:grid-cols-2">
              <section class="surface-card p-3.5 md:p-4" :style="cardStyle">
                <div class="section-kicker !mb-2">Казна</div>
                <h2 class="text-lg font-black text-slate-50">Последние операции</h2>

                <div v-if="treasuryLoading" class="mt-3 space-y-2.5">
                  <div class="skeleton h-16 rounded-2xl"></div>
                  <div class="skeleton h-16 rounded-2xl"></div>
                </div>

                <div v-else-if="!transactions.length" class="action-card mt-4 text-sm text-slate-400" :style="cardStyle">
                  Операций пока нет.
                </div>

                <div v-else class="mt-3 space-y-2.5">
                  <div v-for="item in transactions.slice(0, 5)" :key="item.id" class="action-card" :style="cardStyle">
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <p class="font-semibold text-slate-100">{{ txLabel(item) }}</p>
                        <p class="mt-1 text-sm text-slate-400">{{ item.comment || 'Без комментария' }}</p>
                      </div>
                      <p class="text-sm font-bold text-slate-100">{{ formatNumber(item.amount) }}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section class="surface-card p-3.5 md:p-4" :style="cardStyle">
                <div class="section-kicker !mb-2">Поддержка</div>
                <h2 class="text-lg font-black text-slate-50">Топ донатеров</h2>

                <div v-if="donorsLoading" class="mt-3 space-y-2.5">
                  <div class="skeleton h-16 rounded-2xl"></div>
                  <div class="skeleton h-16 rounded-2xl"></div>
                </div>

                <div v-else-if="!donors.length" class="action-card mt-4 text-sm text-slate-400" :style="cardStyle">
                  Пока никто не пополнял казну через сайт.
                </div>

                <div v-else class="mt-3 space-y-2.5">
                  <div v-for="item in donors.slice(0, 5)" :key="item.user_id || item.site_login" class="action-card" :style="cardStyle">
                    <div class="flex items-center justify-between gap-3">
                      <div class="min-w-0">
                        <p class="font-semibold text-slate-100">{{ item.minecraft_nickname || item.site_login }}</p>
                        <p class="mt-1 text-sm text-slate-400">@{{ item.site_login }}</p>
                      </div>
                      <p class="text-sm font-bold text-slate-100">{{ formatNumber(item.total_amount ?? 0) }}</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
:deep(.route-shell .metric-card),
:deep(.route-shell .action-card) {
  padding: 0.8rem;
}

:deep(.route-shell .btn) {
  min-height: 2.55rem;
}
</style>


