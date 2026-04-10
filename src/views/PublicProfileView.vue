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

const displayName = computed(() => {
  return profile.value?.display_name || profile.value?.player_account?.minecraft_nickname || profile.value?.user?.site_login || 'Игрок'
})

const avatarFallback = computed(() => displayName.value.slice(0, 1).toUpperCase())
const accent = computed(() => profile.value?.accent_color || '#6d5df6')

const bannerUrl = computed(() => {
  return profile.value?.assets?.banner_url || profile.value?.assets?.banner_preview_url || ''
})

const backgroundUrl = computed(() => {
  return profile.value?.assets?.background_url || profile.value?.assets?.background_preview_url || ''
})

const pageShellStyle = computed(() => {
  if (!backgroundUrl.value) {
    return {
      background: `linear-gradient(180deg, ${accent.value}0d 0%, #f8fafc 30%, #eef2ff 100%)`,
    }
  }

  return {
    backgroundImage: `linear-gradient(180deg, rgba(248,250,252,0.84), rgba(241,245,249,0.94)), url(${backgroundUrl.value})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  }
})

const heroStyle = computed(() => {
  if (bannerUrl.value) {
    return {
      backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.12), rgba(15,23,42,0.74)), url(${bannerUrl.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }

  return {
    background: `linear-gradient(135deg, ${accent.value}55, rgba(15,23,42,0.95) 60%, rgba(2,6,23,1))`,
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
  backgroundColor: `${accent.value}18`,
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
    actionMessage.value = 'Ссылка скопирована.'
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

      <div
        v-else-if="error"
        class="mx-auto max-w-3xl rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700"
      >
        {{ error }}
      </div>

      <div
        v-else-if="profile"
        class="overflow-hidden rounded-[32px] border border-slate-200 shadow-[0_22px_80px_rgba(15,23,42,0.10)]"
        :style="pageShellStyle"
      >
        <div class="p-3 md:p-4">
          <div class="space-y-5">
            <section
              class="relative overflow-hidden rounded-[28px] border border-white/40 shadow-[0_26px_100px_rgba(15,23,42,0.16)]"
              :style="heroStyle"
            >
              <div class="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/60"></div>

              <div class="relative px-5 pb-6 pt-6 md:px-8 md:pb-8 md:pt-8">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/85 backdrop-blur-md">
                    Публичный профиль
                  </span>

                  <span
                    class="rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] bg-white/90"
                    :style="accentBadgeStyle"
                  >
                    Акцент
                  </span>
                </div>

                <div class="mt-16 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div class="flex min-w-0 items-end gap-4">
                    <div class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[26px] border-4 border-white/90 bg-white text-3xl font-black uppercase text-slate-700 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
                      <img
                        v-if="profile.assets?.avatar_url || profile.assets?.avatar_preview_url"
                        :src="profile.assets.avatar_url || profile.assets.avatar_preview_url"
                        alt="avatar"
                        class="h-full w-full object-cover"
                      />
                      <span v-else>{{ avatarFallback }}</span>
                    </div>

                    <div class="min-w-0 pb-1 text-white">
                      <div class="flex items-center gap-2">
                        <span class="h-2.5 w-2.5 rounded-full" :style="accentDotStyle"></span>
                        <span class="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">
                          Цвет страницы
                        </span>
                      </div>

                      <h1 class="truncate text-3xl font-black tracking-tight md:text-4xl">
                        {{ displayName }}
                      </h1>

                      <p class="mt-2 text-sm text-white/75 md:text-base">
                        @{{ profile.slug }} · {{ profile.player_account?.minecraft_nickname }}
                      </p>

                      <p v-if="profile.status_text" class="mt-3 max-w-2xl text-sm leading-6 text-white/88 md:text-[15px]">
                        {{ profile.status_text }}
                      </p>
                    </div>
                  </div>

                  <div class="flex flex-wrap gap-3">
                    <button
                      v-if="canFollow"
                      class="btn btn-primary rounded-2xl border-0 bg-white text-slate-950 hover:bg-white/90"
                      :disabled="followLoading"
                      @click="toggleFollow"
                    >
                      <span v-if="followLoading" class="loading loading-spinner loading-sm"></span>
                      <span v-else>{{ profile.viewer?.is_following ? 'Отписаться' : 'Подписаться' }}</span>
                    </button>

                    <RouterLink
                      v-if="profile.viewer?.is_self"
                      to="/profile/public"
                      class="btn btn-outline rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10"
                    >
                      Редактировать
                    </RouterLink>

                    <button
                      type="button"
                      class="btn btn-outline rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10"
                      @click="copyProfileLink"
                    >
                      Поделиться
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <div v-if="actionMessage" class="rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {{ actionMessage }}
            </div>

            <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
              <section class="rounded-[28px] border border-white/50 bg-white/82 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-6">
                <div class="section-kicker !mb-2">О себе</div>
                <h2 class="text-xl font-black text-slate-950 md:text-2xl">Описание игрока</h2>

                <div class="mt-4 h-[2px] w-full rounded-full" :style="accentLineStyle"></div>

                <p class="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700 md:text-[15px]">
                  {{ profile.bio || 'Игрок пока не добавил описание.' }}
                </p>

                <div class="mt-6 grid gap-3 sm:grid-cols-3">
                  <div
                    v-for="item in stats"
                    :key="item.label"
                    class="rounded-[20px] border border-slate-200 bg-slate-50/90 px-4 py-4 text-center"
                  >
                    <p class="text-2xl font-black text-slate-950">{{ item.value }}</p>
                    <p class="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      {{ item.label }}
                    </p>
                  </div>
                </div>
              </section>

              <aside class="space-y-5">
                <section class="rounded-[28px] border border-white/50 bg-white/82 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-6">
                  <div class="section-kicker !mb-2">Профиль</div>
                  <h2 class="text-xl font-black text-slate-950">Кратко</h2>

                  <div class="mt-4 space-y-3">
                    <div class="rounded-[18px] border border-slate-200 bg-slate-50/90 px-4 py-3">
                      <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Логин</p>
                      <p class="mt-2 text-sm font-semibold text-slate-900 break-all">{{ profile.user?.site_login }}</p>
                    </div>

                    <div class="rounded-[18px] border border-slate-200 bg-slate-50/90 px-4 py-3">
                      <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Режим</p>
                      <p class="mt-2 text-sm font-semibold text-slate-900">
                        {{ profile.is_public ? 'Публичный' : 'Скрытый' }}
                      </p>
                    </div>

                    <div v-if="profile.current_referral_rank" class="rounded-[18px] border border-slate-200 bg-slate-50/90 px-4 py-3">
                      <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Ранг</p>
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
