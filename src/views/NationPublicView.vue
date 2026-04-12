<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { approveNationRequest, getNationBySlug, joinNation, rejectNationRequest } from '../services/nationsApi'
import { getNationStatsBySlug } from '../services/nationStatsApi'
import { useAuthStore } from '../stores/authStore'
import { formatCompactHoursFromMinutes, formatNumber, formatRoleLabel, formatRecruitmentLabel } from '../utils/formatters'

const route = useRoute()
const auth = useAuthStore()

const loading = ref(true)
const statsLoading = ref(true)
const error = ref('')
const actionMessage = ref('')
const joinLoading = ref(false)
const requestMessage = ref('')
const nation = ref(null)
const stats = ref(null)

function hexToRgba(hex, alpha) {
  if (!hex || typeof hex !== 'string') {
    return `rgba(109, 93, 246, ${alpha})`
  }

  const value = hex.replace('#', '')
  const normalized = value.length === 3 ? value.split('').map((item) => item + item).join('') : value

  if (normalized.length !== 6) {
    return `rgba(109, 93, 246, ${alpha})`
  }

  const intValue = Number.parseInt(normalized, 16)
  const r = (intValue >> 16) & 255
  const g = (intValue >> 8) & 255
  const b = intValue & 255

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const accent = computed(() => nation.value?.accent_color || '#6d5df6')
const iconUrl = computed(() => nation.value?.assets?.icon_url || nation.value?.assets?.icon_preview_url || '')
const bannerUrl = computed(() => nation.value?.assets?.banner_url || nation.value?.assets?.banner_preview_url || '')
const backgroundUrl = computed(() => nation.value?.assets?.background_url || nation.value?.assets?.background_preview_url || '')
const tagText = computed(() => nation.value?.tag || 'TAG')

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

const canJoin = computed(() => {
  if (!nation.value || !auth.isAuthenticated.value) return false
  if (nation.value.viewer_is_member) return false
  return !nation.value.viewer_request_status
})

const joinLabel = computed(() => {
  if (!nation.value) return 'Вступить'
  if (nation.value.recruitment_policy === 'open') return 'Вступить'
  return 'Подать заявку'
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

async function handleJoin() {
  if (!nation.value || !auth.accessToken) return

  joinLoading.value = true
  error.value = ''
  actionMessage.value = ''

  try {
    const response = await joinNation(auth.accessToken, nation.value.slug, {
      message: requestMessage.value || null,
    })

    nation.value = response?.nation || nation.value
    actionMessage.value = response?.message || 'Действие выполнено.'
    requestMessage.value = ''
  } catch (err) {
    error.value = err.message || 'Не удалось отправить действие.'
  } finally {
    joinLoading.value = false
  }
}

async function handleApprove(requestId) {
  try {
    nation.value = await approveNationRequest(auth.accessToken, nation.value.slug, requestId)
    actionMessage.value = 'Заявка одобрена.'
  } catch (err) {
    error.value = err.message || 'Не удалось одобрить заявку.'
  }
}

async function handleReject(requestId) {
  try {
    nation.value = await rejectNationRequest(auth.accessToken, nation.value.slug, requestId)
    actionMessage.value = 'Заявка отклонена.'
  } catch (err) {
    error.value = err.message || 'Не удалось отклонить заявку.'
  }
}

watch(
  () => route.params.slug,
  async () => {
    await Promise.all([loadNation(), loadStats()])
  },
)

watch(routeBackground, (value) => applyRouteBackground(value), { immediate: true })

onMounted(async () => {
  await Promise.all([loadNation(), loadStats()])
})

onBeforeUnmount(() => {
  document.documentElement.style.removeProperty('--route-bg')
})
</script>

<template>
  <section class="py-6 md:py-8">
    <div class="container-shell">
      <div v-if="loading" class="space-y-5">
        <div class="skeleton h-[320px] rounded-[30px]"></div>
        <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div class="skeleton h-[260px] rounded-[28px]"></div>
          <div class="skeleton h-[260px] rounded-[28px]"></div>
        </div>
      </div>

      <div v-else-if="error" class="mx-auto max-w-3xl alert alert-error">
        {{ error }}
      </div>

      <div v-else-if="nation" class="page-backdrop route-shell overflow-hidden rounded-[32px] border" :style="pageShellStyle">
        <div class="p-3 md:p-4">
          <div class="space-y-4">
            <section class="relative overflow-hidden rounded-[28px] shadow-[0_26px_100px_rgba(0,0,0,0.36)]" :style="heroStyle">
              <div class="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/72"></div>

              <div class="relative px-5 pb-5 pt-5 md:px-7 md:pb-7 md:pt-7">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="rounded-full border border-white/12 bg-black/30 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/84 backdrop-blur-md">
                    Государство
                  </span>
                  <span class="rounded-full border border-white/12 bg-black/30 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/84 backdrop-blur-md">
                    {{ formatRecruitmentLabel(nation.recruitment_policy) }}
                  </span>
                </div>

                <div class="mt-12 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                  <div class="flex min-w-0 items-end gap-4">
                    <div class="flex h-22 w-22 items-center justify-center overflow-hidden rounded-[24px] border-4 border-white/90 bg-slate-900 text-3xl font-black uppercase text-slate-100 shadow-[0_18px_50px_rgba(0,0,0,0.4)] md:h-24 md:w-24">
                      <img v-if="iconUrl" :src="iconUrl" alt="icon" class="h-full w-full object-cover" />
                      <span v-else>{{ tagText.slice(0, 2).toUpperCase() }}</span>
                    </div>

                    <div class="min-w-0 pb-1 text-white">
                      <h1 class="break-words text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] md:text-4xl">
                        {{ nation.title }}
                      </h1>

                      <p class="mt-2 text-sm text-white/76 md:text-base">
                        [{{ nation.tag }}] · {{ nation.short_description || 'Описание пока не добавлено' }}
                      </p>
                    </div>
                  </div>

                  <div class="flex flex-wrap gap-3">
                    <RouterLink v-if="nation.viewer_can_manage" to="/nation/studio" class="btn btn-light rounded-2xl">
                      Управлять
                    </RouterLink>

                    <button
                      v-if="canJoin"
                      type="button"
                      class="btn btn-light rounded-2xl"
                      :disabled="joinLoading"
                      @click="handleJoin"
                    >
                      <span v-if="joinLoading" class="spinner"></span>
                      <span v-else>{{ joinLabel }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <div v-if="actionMessage" class="alert alert-success">
              {{ actionMessage }}
            </div>

            <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <section class="surface-card p-4 md:p-5" :style="cardStyle">
                <div class="section-kicker !mb-2">О государстве</div>
                <h2 class="text-lg font-black text-slate-50 md:text-xl">Описание</h2>
                <p class="mt-3 whitespace-pre-line text-sm leading-6 text-slate-300 md:text-[15px]">
                  {{ nation.description || 'Подробное описание пока не заполнено.' }}
                </p>

                <div v-if="canJoin && nation.recruitment_policy === 'request'" class="action-card mt-5" :style="cardStyle">
                  <p class="metric-label">Сообщение лидеру</p>
                  <textarea
                    v-model="requestMessage"
                    rows="4"
                    class="textarea textarea-bordered mt-3 w-full rounded-2xl"
                    placeholder="Напиши, почему хочешь вступить"
                  ></textarea>
                </div>

                <div class="mt-5">
                  <div class="section-kicker !mb-2">Участники</div>
                  <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <div v-for="member in nation.members" :key="member.user_id" class="action-card" :style="cardStyle">
                      <p class="font-semibold text-slate-100">
                        {{ member.minecraft_nickname || member.site_login }}
                      </p>
                      <p class="mt-1 text-sm text-slate-400">@{{ member.site_login }}</p>
                      <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                        {{ formatRoleLabel(member.role) }}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <aside class="space-y-4">
                <section class="surface-card p-4 md:p-5" :style="cardStyle">
                  <div class="section-kicker !mb-2">Статистика</div>
                  <h2 class="text-lg font-black text-slate-50">Сила государства</h2>

                  <div v-if="statsLoading" class="space-y-3 mt-4">
                    <div class="skeleton h-16 rounded-2xl"></div>
                    <div class="skeleton h-16 rounded-2xl"></div>
                  </div>

                  <div v-else class="metric-grid metric-grid-2 mt-4">
                    <div class="metric-card text-center">
                      <p class="metric-value !text-[1.2rem]">{{ formatNumber(stats?.treasury_balance ?? 0) }}</p>
                      <p class="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Баланс</p>
                    </div>
                    <div class="metric-card text-center">
                      <p class="metric-value !text-[1.2rem]">{{ formatNumber(stats?.territory_points ?? 0) }}</p>
                      <p class="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Территория</p>
                    </div>
                    <div class="metric-card text-center">
                      <p class="metric-value !text-[1.2rem]">{{ formatCompactHoursFromMinutes(stats?.total_playtime_minutes ?? 0) }}</p>
                      <p class="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Онлайн</p>
                    </div>
                    <div class="metric-card text-center">
                      <p class="metric-value !text-[1.2rem]">{{ formatNumber(stats?.pvp_kills ?? 0) }}</p>
                      <p class="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">PvP</p>
                    </div>
                    <div class="metric-card text-center">
                      <p class="metric-value !text-[1.2rem]">{{ formatNumber(stats?.mob_kills ?? 0) }}</p>
                      <p class="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Mobs</p>
                    </div>
                    <div class="metric-card text-center">
                      <p class="metric-value !text-[1.2rem]">{{ formatNumber(stats?.prestige_score ?? 0) }}</p>
                      <p class="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Престиж</p>
                    </div>
                  </div>

                  <RouterLink to="/nations/rankings" class="btn btn-outline mt-4 rounded-2xl">
                    Открыть общий рейтинг
                  </RouterLink>
                </section>

                <section v-if="nation.viewer_can_manage" class="surface-card p-4 md:p-5" :style="cardStyle">
                  <div class="section-kicker !mb-2">Заявки</div>
                  <h2 class="text-lg font-black text-slate-50">Управление вступлением</h2>

                  <div v-if="!nation.join_requests.length" class="action-card mt-4 text-sm text-slate-400" :style="cardStyle">
                    Сейчас нет активных заявок.
                  </div>

                  <div v-else class="mt-4 space-y-3">
                    <div v-for="item in nation.join_requests" :key="item.id" class="action-card" :style="cardStyle">
                      <p class="font-semibold text-slate-100">
                        {{ item.minecraft_nickname || item.site_login }}
                      </p>
                      <p class="mt-1 text-sm leading-6 text-slate-400">
                        {{ item.message || 'Сообщение не указано.' }}
                      </p>

                      <div class="mt-3 flex flex-wrap gap-2">
                        <button type="button" class="btn btn-primary btn-sm rounded-2xl" @click="handleApprove(item.id)">
                          Одобрить
                        </button>
                        <button type="button" class="btn btn-outline btn-sm rounded-2xl" @click="handleReject(item.id)">
                          Отклонить
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
