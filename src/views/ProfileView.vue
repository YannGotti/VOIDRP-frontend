<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getMyPublicProfile } from '../services/profileApi'
import { reloadMe, useAuthStore } from '../stores/authStore'

const auth = useAuthStore()

const loading = ref(false)
const publicProfileLoading = ref(false)
const publicProfile = ref(null)
const publicProfileError = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const avatarText = computed(() => {
  const value =
    publicProfile.value?.display_name ||
    auth.state.playerAccount?.minecraft_nickname ||
    auth.state.user?.site_login ||
    'V'
  return value.slice(0, 1).toUpperCase()
})

const createdAtText = computed(() => {
  const raw = auth.state.user?.created_at
  if (!raw) return '—'
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' }).format(date)
})

const publicProfileLink = computed(() => {
  if (!publicProfile.value?.slug) return ''
  return `/u/${publicProfile.value.slug}`
})

async function loadPublicProfileSummary() {
  publicProfileLoading.value = true
  publicProfileError.value = ''

  try {
    if (!auth.accessToken) {
      publicProfile.value = null
      return
    }
    publicProfile.value = await getMyPublicProfile(auth.accessToken)
  } catch (error) {
    publicProfileError.value = error.message || 'Не удалось загрузить профиль.'
  } finally {
    publicProfileLoading.value = false
  }
}

async function refreshAccount() {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await reloadMe()
    await loadPublicProfileSummary()
    successMessage.value = 'Данные обновлены.'
  } catch (error) {
    errorMessage.value = error.message || 'Не удалось обновить данные.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadPublicProfileSummary()
})
</script>

<template>
  <section class="py-8 md:py-10">
    <div class="container-shell">
      <section class="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)] md:p-7">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div class="flex min-w-0 items-end gap-4">
            <div class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[26px] border border-slate-200 bg-slate-100 text-3xl font-black uppercase text-slate-700 shadow-sm">
              <img
                v-if="publicProfile?.assets?.avatar_url || publicProfile?.assets?.avatar_preview_url"
                :src="publicProfile.assets.avatar_url || publicProfile.assets.avatar_preview_url"
                alt="avatar"
                class="h-full w-full object-cover"
              />
              <span v-else>{{ avatarText }}</span>
            </div>

            <div class="min-w-0">
              <div class="section-kicker !mb-2">Личный кабинет</div>
              <h1 class="truncate text-2xl font-black tracking-tight text-slate-950 md:text-4xl">
                {{ publicProfile?.display_name || auth.displayName.value }}
              </h1>
              <p class="mt-2 text-sm text-slate-600 md:text-[15px]">
                {{ auth.state.user?.email || 'Почта не указана' }}
              </p>
              <p class="mt-1 text-sm text-slate-500">
                Minecraft: {{ auth.state.playerAccount?.minecraft_nickname || '—' }}
              </p>
            </div>
          </div>

          <div class="flex flex-wrap gap-3">
            <RouterLink to="/profile/public" class="btn btn-primary rounded-2xl">
              Редактировать профиль
            </RouterLink>
            <RouterLink
              v-if="publicProfile?.slug"
              :to="publicProfileLink"
              class="btn btn-outline rounded-2xl"
            >
              Открыть страницу
            </RouterLink>
            <button type="button" class="btn btn-ghost rounded-2xl" :disabled="loading" @click="refreshAccount">
              {{ loading ? 'Обновляем...' : 'Обновить' }}
            </button>
          </div>
        </div>

        <p v-if="errorMessage" class="mt-4 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {{ errorMessage }}
        </p>
        <p v-if="successMessage" class="mt-4 rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {{ successMessage }}
        </p>
        <p v-if="publicProfileError" class="mt-4 rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {{ publicProfileError }}
        </p>
      </section>

      <div class="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-6">
          <div class="section-kicker !mb-2">Профиль</div>
          <h2 class="text-xl font-black text-slate-950 md:text-2xl">Главное</h2>

          <div class="mt-5 grid gap-3 sm:grid-cols-2">
            <div class="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
              <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Логин</p>
              <p class="mt-2 text-sm font-semibold text-slate-900 break-all">{{ auth.state.user?.site_login || '—' }}</p>
            </div>

            <div class="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
              <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Дата регистрации</p>
              <p class="mt-2 text-sm font-semibold text-slate-900">{{ createdAtText }}</p>
            </div>

            <div class="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
              <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Email подтверждён</p>
              <p class="mt-2 text-sm font-semibold text-slate-900">{{ auth.emailVerified.value ? 'Да' : 'Нет' }}</p>
            </div>

            <div class="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
              <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Режим входа</p>
              <p class="mt-2 text-sm font-semibold text-slate-900">{{ auth.accountModeText.value }}</p>
            </div>
          </div>
        </section>

        <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-6">
          <div class="section-kicker !mb-2">Быстрые действия</div>
          <h2 class="text-xl font-black text-slate-950 md:text-2xl">Что делать дальше</h2>

          <div class="mt-5 grid gap-3">
            <RouterLink to="/profile/public" class="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-slate-100">
              <p class="font-semibold text-slate-900">Настроить внешний вид профиля</p>
              <p class="mt-1 text-sm leading-6 text-slate-600">Баннер, аватар, имя, статус и описание.</p>
            </RouterLink>

            <RouterLink to="/profile/referrals" class="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-slate-100">
              <p class="font-semibold text-slate-900">Открыть реферальный центр</p>
              <p class="mt-1 text-sm leading-6 text-slate-600">Код приглашения, ранг и статистика.</p>
            </RouterLink>

            <RouterLink to="/profile/social" class="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-slate-100">
              <p class="font-semibold text-slate-900">Друзья и подписки</p>
              <p class="mt-1 text-sm leading-6 text-slate-600">Социальный блок без перегрузки на главной.</p>
            </RouterLink>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>