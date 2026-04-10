<script setup>
import { computed, onMounted, ref, watch } from 'vue'
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

const accent = computed(() => nation.value?.accent_color || '#6d5df6')
const iconUrl = computed(() => nation.value?.assets?.icon_url || nation.value?.assets?.icon_preview_url || '')
const bannerUrl = computed(() => nation.value?.assets?.banner_url || nation.value?.assets?.banner_preview_url || '')
const backgroundUrl = computed(() => nation.value?.assets?.background_url || nation.value?.assets?.background_preview_url || '')
const tagText = computed(() => nation.value?.tag || 'TAG')

const pageShellStyle = computed(() => {
  if (!backgroundUrl.value) {
    return {
      background:
        `radial-gradient(circle at top left, ${accent.value}22 0%, transparent 28%), ` +
        'linear-gradient(180deg, rgba(248,250,252,0.96) 0%, rgba(238,242,255,0.98) 100%)',
    }
  }
  return {
    backgroundImage: `linear-gradient(180deg, rgba(248,250,252,0.88), rgba(241,245,249,0.94)), url(${backgroundUrl.value})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
})

const heroStyle = computed(() => {
  if (bannerUrl.value) {
    return {
      backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.14), rgba(15,23,42,0.74)), url(${bannerUrl.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }
  return {
    background: `radial-gradient(circle at top left, ${accent.value}28 0%, transparent 32%), linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(17,24,39,0.98) 52%, rgba(31,45,99,1) 100%)`,
  }
})

const canJoin = computed(() => {
  if (!nation.value || !auth.isAuthenticated.value) return false
  if (nation.value.viewer_is_member) return false
  return !nation.value.viewer_request_status
})

const joinLabel = computed(() => nation.value?.recruitment_policy === 'open' ? 'Вступить' : 'Подать заявку')

function recruitmentLabel(value) {
  if (value === 'open') return 'Свободное вступление'
  if (value === 'request') return 'По заявке'
  return 'Только по приглашению'
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
    const response = await joinNation(auth.accessToken, nation.value.slug, { message: requestMessage.value || null })
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

watch(() => route.params.slug, loadNation)
onMounted(loadNation)
</script>

<template>
  <section class="py-8 md:py-10">
    <div class="container-shell">
      <div v-if="loading" class="space-y-5">
        <div class="skeleton h-[320px] rounded-[30px]"></div>
        <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div class="skeleton h-[300px] rounded-[28px]"></div>
          <div class="skeleton h-[220px] rounded-[28px]"></div>
        </div>
      </div>

      <div v-else-if="error" class="mx-auto max-w-3xl alert alert-error">{{ error }}</div>

      <div v-else-if="nation" class="page-backdrop rounded-[32px]" :style="pageShellStyle">
        <div class="p-3 md:p-4">
          <div class="space-y-5">
            <section class="relative overflow-hidden rounded-[28px]" :style="heroStyle">
              <div class="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/65"></div>
              <div class="relative px-5 pb-6 pt-6 md:px-8 md:pb-8 md:pt-8">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="rounded-full border border-white/18 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/86 backdrop-blur-md">Государство</span>
                  <span class="rounded-full border border-white/18 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/86 backdrop-blur-md">{{ recruitmentLabel(nation.recruitment_policy) }}</span>
                </div>

                <div class="mt-14 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                  <div class="flex min-w-0 items-end gap-4">
                    <div class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[26px] border-4 border-white/90 bg-white text-3xl font-black uppercase text-slate-700 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
                      <img v-if="iconUrl" :src="iconUrl" alt="icon" class="h-full w-full object-cover" />
                      <span v-else>{{ tagText.slice(0, 2).toUpperCase() }}</span>
                    </div>

                    <div class="min-w-0 pb-1 text-white">
                      <h1 class="truncate text-3xl font-black tracking-tight md:text-4xl">{{ nation.title }}</h1>
                      <p class="mt-2 text-sm text-white/76 md:text-base">[{{ nation.tag }}] · {{ nation.short_description || 'Описание пока не добавлено' }}</p>
                    </div>
                  </div>

                  <div class="flex flex-wrap gap-3">
                    <RouterLink v-if="nation.viewer_can_manage" to="/nation/studio" class="btn btn-light rounded-2xl">Управлять</RouterLink>
                    <button v-if="canJoin" type="button" class="btn btn-outline rounded-2xl border-white/20 bg-white text-slate-950 hover:bg-white/90" :disabled="joinLoading" @click="handleJoin">
                      <span v-if="joinLoading" class="spinner"></span>
                      <span>{{ joinLabel }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <div v-if="actionMessage" class="alert alert-success">{{ actionMessage }}</div>

            <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <section class="surface-card p-5 md:p-6">
                <div class="section-kicker !mb-2">Описание</div>
                <h2 class="text-xl font-black text-slate-950 md:text-2xl">О государстве</h2>
                <p class="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700 md:text-[15px]">{{ nation.description || 'Подробное описание пока не заполнено.' }}</p>

                <div v-if="canJoin && nation.recruitment_policy === 'request'" class="action-card mt-5">
                  <p class="metric-label">Сообщение лидеру</p>
                  <textarea v-model="requestMessage" rows="4" class="textarea textarea-bordered mt-3 w-full rounded-2xl" placeholder="Напиши, почему хочешь вступить"></textarea>
                </div>

                <div class="mt-5">
                  <div class="section-kicker !mb-2">Участники</div>
                  <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <div v-for="member in nation.members" :key="member.user_id" class="action-card">
                      <p class="font-semibold text-slate-900">{{ member.minecraft_nickname || member.site_login }}</p>
                      <p class="mt-1 text-sm text-slate-500">@{{ member.site_login }}</p>
                      <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{{ member.role }}</p>
                    </div>
                  </div>
                </div>
              </section>

              <aside class="space-y-5">
                <section class="surface-card p-5 md:p-6">
                  <div class="section-kicker !mb-2">Статистика</div>
                  <h2 class="text-xl font-black text-slate-950">Кратко</h2>
                  <div class="metric-grid metric-grid-2 mt-5">
                    <div class="metric-card text-center">
                      <p class="metric-value !text-[1.4rem]">{{ nation.stats.members_count }}</p>
                      <p class="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Участники</p>
                    </div>
                    <div class="metric-card text-center">
                      <p class="metric-value !text-[1.4rem]">{{ nation.stats.pending_requests_count }}</p>
                      <p class="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Заявки</p>
                    </div>
                  </div>
                </section>

                <section v-if="nation.viewer_can_manage" class="surface-card p-5 md:p-6">
                  <div class="section-kicker !mb-2">Заявки</div>
                  <h2 class="text-xl font-black text-slate-950">Управление вступлением</h2>
                  <div v-if="!nation.join_requests.length" class="action-card mt-4 text-sm text-slate-600">Сейчас нет активных заявок.</div>

                  <div v-else class="mt-4 space-y-3">
                    <div v-for="item in nation.join_requests" :key="item.id" class="action-card">
                      <p class="font-semibold text-slate-900">{{ item.minecraft_nickname || item.site_login }}</p>
                      <p class="mt-1 text-sm leading-6 text-slate-600">{{ item.message || 'Сообщение не указано.' }}</p>
                      <div class="mt-3 flex flex-wrap gap-2">
                        <button type="button" class="btn btn-primary btn-sm rounded-2xl" @click="handleApprove(item.id)">Одобрить</button>
                        <button type="button" class="btn btn-outline btn-sm rounded-2xl" @click="handleReject(item.id)">Отклонить</button>
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
