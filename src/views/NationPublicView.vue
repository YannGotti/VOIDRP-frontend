<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { approveNationRequest, getNationBySlug, joinNation, rejectNationRequest } from '../services/nationsApi'
import { useAuthStore } from '../stores/authStore'

const route = useRoute()
const auth = useAuthStore()

const loading = ref(true)
const error = ref('')
const actionMessage = ref('')
const joinLoading = ref(false)
const requestMessage = ref('')
const nation = ref(null)

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
        'linear-gradient(180deg, rgba(4,6,11,0.08), rgba(4,6,11,0.74))',
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

const accentBadgeStyle = computed(() => ({
  borderColor: accent.value,
  backgroundColor: hexToRgba(accent.value, 0.12),
  color: accent.value,
}))

const sectionCardStyle = computed(() => ({
  borderColor: hexToRgba(accent.value, 0.14),
  background: `linear-gradient(180deg, rgba(9,14,24,0.94), ${hexToRgba(accent.value, 0.08)})`,
  boxShadow: `0 18px 50px ${hexToRgba(accent.value, 0.1)}`,
}))

const innerCardStyle = computed(() => ({
  borderColor: hexToRgba(accent.value, 0.12),
  backgroundColor: hexToRgba(accent.value, 0.05),
}))

const statCardStyle = computed(() => ({
  borderColor: hexToRgba(accent.value, 0.14),
  background: `linear-gradient(180deg, rgba(6,10,18,0.96), ${hexToRgba(accent.value, 0.1)})`,
  boxShadow: `0 12px 34px ${hexToRgba(accent.value, 0.1)}`,
}))

const canJoin = computed(() => {
  if (!nation.value || !auth.isAuthenticated.value) return false
  if (nation.value.viewer_is_member) return false
  return !nation.value.viewer_request_status
})

const joinLabel = computed(() =>
  nation.value?.recruitment_policy === 'open' ? 'Вступить' : 'Подать заявку',
)

function recruitmentLabel(value) {
  if (value === 'open') return 'Свободное вступление'
  if (value === 'request') return 'По заявке'
  return 'Только по приглашению'
}

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
  if (!nation.value || !auth.accessToken) return

  try {
    nation.value = await approveNationRequest(auth.accessToken, nation.value.slug, requestId)
    actionMessage.value = 'Заявка одобрена.'
    error.value = ''
  } catch (err) {
    error.value = err.message || 'Не удалось одобрить заявку.'
  }
}

async function handleReject(requestId) {
  if (!nation.value || !auth.accessToken) return

  try {
    nation.value = await rejectNationRequest(auth.accessToken, nation.value.slug, requestId)
    actionMessage.value = 'Заявка отклонена.'
    error.value = ''
  } catch (err) {
    error.value = err.message || 'Не удалось отклонить заявку.'
  }
}

watch(() => route.params.slug, loadNation)
watch(routeBackground, (value) => applyRouteBackground(value), { immediate: true })

onMounted(loadNation)

onBeforeUnmount(() => {
  document.documentElement.style.removeProperty('--route-bg')
})
</script>

<template>
  <section class="py-6 md:py-8">
    <div class="container-shell">
      <div v-if="loading" class="space-y-5">
        <div class="skeleton h-[320px] rounded-[30px]"></div>
        <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div class="skeleton h-[300px] rounded-[28px]"></div>
          <div class="skeleton h-[220px] rounded-[28px]"></div>
        </div>
      </div>

      <div v-else-if="error" class="mx-auto max-w-3xl alert alert-error">
        {{ error }}
      </div>

      <div
        v-else-if="nation"
        class="overflow-hidden rounded-[28px] border shadow-[0_18px_70px_rgba(0,0,0,0.28)]"
        :style="pageShellStyle"
      >
        <div class="p-3">
          <div class="overflow-hidden rounded-[24px] border border-white/10 bg-black/20 backdrop-blur">
            <section class="relative overflow-hidden rounded-[24px]" :style="heroStyle">
              <div class="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/72"></div>

              <div class="absolute left-4 top-4 flex flex-wrap gap-2">
                <span class="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/88 backdrop-blur-md">
                  Государство
                </span>

                <span class="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/88 backdrop-blur-md">
                  {{ recruitmentLabel(nation.recruitment_policy) }}
                </span>

                <span
                  class="rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em]"
                  :style="accentBadgeStyle"
                >
                  Акцент
                </span>
              </div>

              <div class="relative px-4 pb-5 pt-20 md:px-6 md:pb-6 md:pt-24">
                <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div class="flex min-w-0 items-end gap-4">
                    <div class="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[24px] border-4 border-white/90 bg-slate-900 text-3xl font-black uppercase text-slate-100 shadow-[0_18px_50px_rgba(0,0,0,0.34)]">
                      <img v-if="iconUrl" :src="iconUrl" alt="icon" class="h-full w-full object-cover" />
                      <span v-else>{{ tagText.slice(0, 2).toUpperCase() }}</span>
                    </div>

                    <div class="min-w-0 pb-1 text-white">
                      <h1 class="truncate text-3xl font-black tracking-tight md:text-4xl">
                        {{ nation.title }}
                      </h1>
                      <p class="mt-2 text-sm text-white/76 md:text-base">
                        [{{ nation.tag }}] · {{ nation.short_description || 'Описание пока не добавлено' }}
                      </p>
                    </div>
                  </div>

                  <div class="flex flex-wrap gap-3">
                    <RouterLink
                      v-if="nation.viewer_can_manage"
                      to="/nation/studio"
                      class="btn btn-light rounded-2xl"
                    >
                      Управлять
                    </RouterLink>

                    <button
                      v-if="canJoin"
                      type="button"
                      class="btn btn-outline rounded-2xl border-white/20 bg-white text-slate-950 hover:bg-white/90"
                      :disabled="joinLoading"
                      @click="handleJoin"
                    >
                      <span v-if="joinLoading" class="spinner"></span>
                      <span>{{ joinLabel }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <div class="p-4 md:p-5">
              <div v-if="actionMessage" class="alert alert-success mb-5">
                {{ actionMessage }}
              </div>

              <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <section class="rounded-[24px] border p-5 backdrop-blur md:p-6" :style="sectionCardStyle">
                  <div class="section-kicker !mb-2">Описание</div>
                  <h2 class="text-xl font-black text-slate-50 md:text-2xl">О государстве</h2>

                  <p class="mt-4 whitespace-pre-line text-sm leading-7 text-slate-300 md:text-[15px]">
                    {{ nation.description || 'Подробное описание пока не заполнено.' }}
                  </p>

                  <div
                    v-if="canJoin && nation.recruitment_policy === 'request'"
                    class="mt-5 rounded-[20px] border p-4 backdrop-blur"
                    :style="innerCardStyle"
                  >
                    <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                      Сообщение лидеру
                    </p>
                    <textarea
                      v-model="requestMessage"
                      rows="4"
                      class="textarea textarea-bordered mt-3 w-full rounded-2xl border-white/10 bg-black/30 text-slate-100 placeholder:text-slate-500"
                      placeholder="Напиши, почему хочешь вступить"
                    ></textarea>
                  </div>

                  <div class="mt-5">
                    <div class="section-kicker !mb-2">Участники</div>

                    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      <div
                        v-for="member in nation.members"
                        :key="member.user_id"
                        class="rounded-[20px] border p-4 backdrop-blur"
                        :style="innerCardStyle"
                      >
                        <p class="font-semibold text-slate-100">
                          {{ member.minecraft_nickname || member.site_login }}
                        </p>
                        <p class="mt-1 text-sm text-slate-400">
                          @{{ member.site_login }}
                        </p>
                        <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                          {{ member.role }}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <aside class="space-y-5">
                  <section class="rounded-[24px] border p-5 backdrop-blur md:p-6" :style="sectionCardStyle">
                    <div class="section-kicker !mb-2">Статистика</div>
                    <h2 class="text-xl font-black text-slate-50">Кратко</h2>

                    <div class="mt-5 grid grid-cols-2 gap-3">
                      <div class="rounded-[20px] border p-5 text-center" :style="statCardStyle">
                        <p class="text-[1.55rem] font-black tracking-tight text-white">
                          {{ nation.stats?.members_count ?? 0 }}
                        </p>
                        <p class="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                          Участники
                        </p>
                      </div>

                      <div class="rounded-[20px] border p-5 text-center" :style="statCardStyle">
                        <p class="text-[1.55rem] font-black tracking-tight text-white">
                          {{ nation.stats?.pending_requests_count ?? 0 }}
                        </p>
                        <p class="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                          Заявки
                        </p>
                      </div>
                    </div>
                  </section>

                  <section
                    v-if="nation.viewer_can_manage"
                    class="rounded-[24px] border p-5 backdrop-blur md:p-6"
                    :style="sectionCardStyle"
                  >
                    <div class="section-kicker !mb-2">Заявки</div>
                    <h2 class="text-xl font-black text-slate-50">Управление вступлением</h2>

                    <div
                      v-if="!nation.join_requests?.length"
                      class="mt-4 rounded-[18px] border px-4 py-3 text-sm text-slate-300"
                      :style="innerCardStyle"
                    >
                      Сейчас нет активных заявок.
                    </div>

                    <div v-else class="mt-4 space-y-3">
                      <div
                        v-for="item in nation.join_requests"
                        :key="item.id"
                        class="rounded-[20px] border p-4 backdrop-blur"
                        :style="innerCardStyle"
                      >
                        <p class="font-semibold text-slate-100">
                          {{ item.minecraft_nickname || item.site_login }}
                        </p>

                        <p class="mt-1 text-sm leading-6 text-slate-300">
                          {{ item.message || 'Игрок не оставил сообщение.' }}
                        </p>

                        <div class="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            class="btn btn-primary btn-sm rounded-2xl"
                            @click="handleApprove(item.id)"
                          >
                            Одобрить
                          </button>

                          <button
                            type="button"
                            class="btn btn-outline btn-sm rounded-2xl"
                            @click="handleReject(item.id)"
                          >
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
    </div>
  </section>
</template>