<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getPublicProfileBySlug } from '../services/profileApi'
import { followProfile, unfollowProfile } from '../services/socialApi'
import { useAuthStore } from '../stores/authStore'

const route = useRoute()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref('')
const actionMessage = ref('')
const followLoading = ref(false)
const profile = ref(null)

function hexToRgba(hex, alpha) {
  if (!hex || typeof hex !== 'string') return `rgba(91, 108, 255, ${alpha})`
  const value = hex.replace('#', '')
  const normalized = value.length === 3 ? value.split('').map((x) => x + x).join('') : value

  if (normalized.length !== 6) {
    return `rgba(91, 108, 255, ${alpha})`
  }

  const intValue = Number.parseInt(normalized, 16)
  const r = (intValue >> 16) & 255
  const g = (intValue >> 8) & 255
  const b = intValue & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const displayName = computed(() => {
  return (
    profile.value?.display_name ||
    profile.value?.player_account?.minecraft_nickname ||
    profile.value?.user?.site_login ||
    'Игрок'
  )
})

const avatarFallback = computed(() => displayName.value.slice(0, 1).toUpperCase())
const accent = computed(() => profile.value?.accent_color || '#6d5df6')
const avatarUrl = computed(() => profile.value?.assets?.avatar_url || profile.value?.assets?.avatar_preview_url || '')
const bannerUrl = computed(() => profile.value?.assets?.banner_url || profile.value?.assets?.banner_preview_url || '')
const backgroundUrl = computed(() => profile.value?.assets?.background_url || profile.value?.assets?.background_preview_url || '')

const pageShellStyle = computed(() => {
  if (!backgroundUrl.value) {
    return {
      background:
        `radial-gradient(circle at top left, ${hexToRgba(accent.value, 0.16)} 0%, transparent 28%), ` +
        'linear-gradient(180deg, rgba(248,250,252,0.96) 0%, rgba(238,242,255,0.98) 100%)',
    }
  }

  return {
    backgroundImage:
      `linear-gradient(180deg, rgba(248,250,252,0.88), rgba(241,245,249,0.94)), url(${backgroundUrl.value})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
})

const heroStyle = computed(() => {
  if (bannerUrl.value) {
    return {
      backgroundImage:
        `linear-gradient(180deg, rgba(15,23,42,0.14), rgba(15,23,42,0.74)), url(${bannerUrl.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }

  return {
    background:
      `radial-gradient(circle at top left, ${hexToRgba(accent.value, 0.28)} 0%, transparent 32%), ` +
      'linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(17,24,39,0.98) 52%, rgba(31,45,99,1) 100%)',
  }
})

const canFollow = computed(() => {
  if (!profile.value) return false
  if (profile.value.viewer?.is_self) return false
  return Boolean(authStore.accessToken)
})

const stats = computed(() => {
  if (!profile.value) return []
  return [
    { label: 'Подписчики', value: Number(profile.value?.stats?.followers || 0) },
    { label: 'Подписки', value: Number(profile.value?.stats?.following || 0) },
    { label: 'Друзья', value: Number(profile.value?.stats?.friends || 0) },
  ]
})

const accentBadgeStyle = computed(() => ({
  borderColor: accent.value,
  backgroundColor: hexToRgba(accent.value, 0.14),
  color: accent.value,
}))

const accentDotStyle = computed(() => ({
  backgroundColor: accent.value,
}))

const accentLineStyle = computed(() => ({
  background: `linear-gradient(90deg, ${accent.value}, transparent)`,
}))

async function loadProfile() {
  loading.value = true
  error.value = ''
  actionMessage.value = ''

  try {
    profile.value = await getPublicProfileBySlug(route.params.slug, authStore.accessToken || null)
  } catch (err) {
    error.value = err.message || 'Не удалось загрузить профиль.'
  } finally {
    loading.value = false
  }
}

async function toggleFollow() {
  if (!profile.value || !authStore.accessToken) return

  followLoading.value = true
  error.value = ''
  actionMessage.value = ''

  try {
    const wasFollowing = Boolean(profile.value.viewer?.is_following)

    if (wasFollowing) {
      await unfollowProfile(authStore.accessToken, profile.value.slug)
    } else {
      await followProfile(authStore.accessToken, profile.value.slug)
    }

    await loadProfile()
    actionMessage.value = wasFollowing ? 'Подписка удалена.' : 'Подписка оформлена.'
  } catch (err) {
    error.value = err.message || 'Не удалось изменить подписку.'
  } finally {
    followLoading.value = false
  }
}

async function copyProfileLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    actionMessage.value = 'Ссылка на профиль скопирована.'
    error.value = ''
  } catch {
    error.value = 'Не удалось скопировать ссылку.'
  }
}

watch(() => route.params.slug, loadProfile)
onMounted(loadProfile)
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

      <div v-else-if="error" class="mx-auto max-w-3xl alert alert-error">
        {{ error }}
      </div>

      <div v-else-if="profile" class="page-backdrop rounded-[32px]" :style="pageShellStyle">
        <div class="p-3 md:p-4">
          <div class="space-y-5">
            <section class="relative overflow-hidden rounded-[28px]" :style="heroStyle">
              <div class="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/65"></div>

              <div class="relative px-5 pb-6 pt-6 md:px-8 md:pb-8 md:pt-8">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="rounded-full border border-white/18 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/86 backdrop-blur-md">
                    Публичный профиль
                  </span>
                  <span class="rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] bg-white/90" :style="accentBadgeStyle">
                    Акцент
                  </span>
                </div>

                <div class="mt-14 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                  <div class="flex min-w-0 items-end gap-4">
                    <div class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[26px] border-4 border-white/90 bg-white text-3xl font-black uppercase text-slate-700 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
                      <img v-if="avatarUrl" :src="avatarUrl" alt="avatar" class="h-full w-full object-cover" />
                      <span v-else>{{ avatarFallback }}</span>
                    </div>

                    <div class="min-w-0 pb-1 text-white">
                      <div class="flex items-center gap-2">
                        <span class="h-2.5 w-2.5 rounded-full" :style="accentDotStyle"></span>
                        <span class="text-[11px] font-bold uppercase tracking-[0.22em] text-white/72">
                          Цвет страницы
                        </span>
                      </div>

                      <h1 class="truncate text-3xl font-black tracking-tight md:text-4xl">
                        {{ displayName }}
                      </h1>

                      <p class="mt-2 text-sm text-white/76 md:text-base">
                        @{{ profile.slug }}
                        <span v-if="profile.player_account?.minecraft_nickname">
                          · {{ profile.player_account.minecraft_nickname }}
                        </span>
                      </p>

                      <p v-if="profile.status_text" class="mt-3 max-w-2xl text-sm leading-6 text-white/88 md:text-[15px]">
                        {{ profile.status_text }}
                      </p>
                    </div>
                  </div>

                  <div class="flex flex-wrap gap-3">
                    <button
                      v-if="canFollow"
                      class="btn btn-outline rounded-2xl border-white/20 bg-white text-slate-950 hover:bg-white/90"
                      :disabled="followLoading"
                      @click="toggleFollow"
                    >
                      <span v-if="followLoading" class="spinner"></span>
                      <span>{{ profile.viewer?.is_following ? 'Отписаться' : 'Подписаться' }}</span>
                    </button>

                    <RouterLink
                      v-else-if="!profile.viewer?.is_self && !authStore.isAuthenticated.value"
                      to="/login"
                      class="btn btn-outline rounded-2xl border-white/20 bg-white text-slate-950 hover:bg-white/90"
                    >
                      Войти, чтобы подписаться
                    </RouterLink>

                    <RouterLink
                      v-if="profile.viewer?.is_self"
                      to="/profile/public"
                      class="btn btn-light rounded-2xl"
                    >
                      Редактировать
                    </RouterLink>

                    <button type="button" class="btn btn-light rounded-2xl" @click="copyProfileLink">
                      Поделиться
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <div v-if="actionMessage" class="alert alert-success">
              {{ actionMessage }}
            </div>

            <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
              <section class="surface-card p-5 md:p-6">
                <div class="section-kicker !mb-2">О себе</div>
                <h2 class="text-xl font-black text-slate-950 md:text-2xl">Описание игрока</h2>

                <div class="mt-4 h-[2px] w-full rounded-full" :style="accentLineStyle"></div>

                <p class="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700 md:text-[15px]">
                  {{ profile.bio || 'Игрок пока не добавил описание.' }}
                </p>

                <div class="metric-grid metric-grid-3 mt-6">
                  <div v-for="item in stats" :key="item.label" class="metric-card text-center">
                    <p class="text-2xl font-black text-slate-950">{{ item.value }}</p>
                    <p class="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      {{ item.label }}
                    </p>
                  </div>
                </div>
              </section>

              <aside class="space-y-5">
                <section class="surface-card p-5 md:p-6">
                  <div class="section-kicker !mb-2">Кратко</div>
                  <h2 class="text-xl font-black text-slate-950">О профиле</h2>

                  <div class="mt-4 space-y-3">
                    <div class="action-card">
                      <p class="metric-label">Логин</p>
                      <p class="mt-2 break-all text-sm font-semibold text-slate-900">
                        {{ profile.user?.site_login }}
                      </p>
                    </div>

                    <div class="action-card">
                      <p class="metric-label">Видимость</p>
                      <p class="mt-2 text-sm font-semibold text-slate-900">
                        {{ profile.is_public ? 'Публичный' : 'Скрытый' }}
                      </p>
                    </div>

                    <div v-if="profile.current_referral_rank" class="action-card">
                      <p class="metric-label">Ранг</p>
                      <p class="mt-2 text-sm font-semibold text-slate-900">
                        {{ profile.current_referral_rank }}
                      </p>
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
