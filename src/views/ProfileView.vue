<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AccountTabs from '../components/AccountTabs.vue'
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

const avatarUrl = computed(
  () => publicProfile.value?.assets?.avatar_url || publicProfile.value?.assets?.avatar_preview_url || '',
)

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
    publicProfileError.value = error.message || 'Не удалось загрузить публичный профиль.'
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
    successMessage.value = 'Данные профиля обновлены.'
  } catch (error) {
    errorMessage.value = error.message || 'Не удалось обновить данные.'
  } finally {
    loading.value = false
  }
}

onMounted(loadPublicProfileSummary)
</script>

<template>
  <section class="py-8 md:py-10">
    <div class="container-shell space-y-5">
      <section class="surface-card p-5 md:p-7">
        <div class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div class="flex min-w-0 items-start gap-4 md:items-end">
            <div class="preview-avatar h-24 w-24 border border-slate-200 text-3xl uppercase shadow-sm">
              <img v-if="avatarUrl" :src="avatarUrl" alt="avatar" class="h-full w-full object-cover" />
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
              Настроить профиль
            </RouterLink>
            <RouterLink v-if="publicProfile?.slug" :to="publicProfileLink" class="btn btn-outline rounded-2xl">
              Открыть страницу
            </RouterLink>
            <button type="button" class="btn btn-ghost rounded-2xl" :disabled="loading" @click="refreshAccount">
              <span v-if="loading" class="spinner"></span>
              <span>{{ loading ? 'Обновляем...' : 'Обновить' }}</span>
            </button>
          </div>
        </div>

        <p v-if="errorMessage" class="alert alert-error mt-4">{{ errorMessage }}</p>
        <p v-if="successMessage" class="alert alert-success mt-4">{{ successMessage }}</p>
        <p v-if="publicProfileError" class="alert alert-warn mt-4">{{ publicProfileError }}</p>
      </section>

      <AccountTabs />

      <div class="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <section class="surface-card p-5 md:p-6">
          <div class="section-kicker !mb-2">Без перегруза</div>
          <h2 class="text-xl font-black text-slate-950 md:text-2xl">Главное по аккаунту</h2>
          <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-[15px]">
            Здесь только то, что реально нужно игроку: вход, ник, состояние профиля и быстрые переходы.
          </p>

          <div class="metric-grid metric-grid-2 mt-5">
            <div class="metric-card">
              <p class="metric-label">Логин</p>
              <p class="mt-2 break-all text-sm font-semibold text-slate-900">
                {{ auth.state.user?.site_login || '—' }}
              </p>
            </div>

            <div class="metric-card">
              <p class="metric-label">Дата регистрации</p>
              <p class="mt-2 text-sm font-semibold text-slate-900">{{ createdAtText }}</p>
            </div>

            <div class="metric-card">
              <p class="metric-label">Email подтверждён</p>
              <p class="mt-2 text-sm font-semibold text-slate-900">
                {{ auth.emailVerified.value ? 'Да' : 'Нет' }}
              </p>
            </div>

            <div class="metric-card">
              <p class="metric-label">Публичный профиль</p>
              <p class="mt-2 text-sm font-semibold text-slate-900">
                {{ publicProfile?.is_public ? 'Открыт' : 'Скрыт' }}
              </p>
            </div>
          </div>

          <div class="action-card mt-5">
            <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div class="min-w-0">
                <p class="metric-label">Страница игрока</p>
                <h3 class="mt-2 text-lg font-black text-slate-950">
                  {{ publicProfile?.status_text || 'Добавь короткий статус, чтобы профиль выглядел живее.' }}
                </h3>
                <p class="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                  {{ publicProfile?.bio || 'Описание ещё не заполнено. Можно добавить баннер, фон страницы, аватар и рассказ о себе.' }}
                </p>
              </div>

              <RouterLink to="/profile/public" class="btn btn-outline rounded-2xl md:self-start">
                Редактировать
              </RouterLink>
            </div>
          </div>
        </section>

        <div class="space-y-5">
          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Быстрые переходы</div>
            <h2 class="text-xl font-black text-slate-950 md:text-2xl">Что можно сделать</h2>

            <div class="mt-5 grid gap-3">
              <RouterLink to="/profile/public" class="action-card transition hover:border-slate-300 hover:bg-slate-50">
                <p class="font-semibold text-slate-900">Настроить внешний вид профиля</p>
                <p class="mt-1 text-sm leading-6 text-slate-600">
                  Имя, статус, описание, баннер, аватар и фон страницы.
                </p>
              </RouterLink>

              <RouterLink to="/download-launcher" class="action-card transition hover:border-slate-300 hover:bg-slate-50">
                <p class="font-semibold text-slate-900">Скачать лаунчер</p>
                <p class="mt-1 text-sm leading-6 text-slate-600">
                  Основной путь входа на сервер без лишней ручной настройки.
                </p>
              </RouterLink>

              <RouterLink to="/profile/referrals" class="action-card transition hover:border-slate-300 hover:bg-slate-50">
                <p class="font-semibold text-slate-900">Открыть реферальный центр</p>
                <p class="mt-1 text-sm leading-6 text-slate-600">
                  Код приглашения, прогресс и недавние регистрации.
                </p>
              </RouterLink>

              <RouterLink to="/profile/social" class="action-card transition hover:border-slate-300 hover:bg-slate-50">
                <p class="font-semibold text-slate-900">Друзья и подписки</p>
                <p class="mt-1 text-sm leading-6 text-slate-600">
                  Социальный блок вынесен отдельно, чтобы кабинет оставался чистым.
                </p>
              </RouterLink>
            </div>
          </section>

          <section v-if="publicProfileLoading" class="surface-card p-5 md:p-6">
            <div class="skeleton h-6 w-40 rounded-full"></div>
            <div class="mt-4 space-y-3">
              <div class="skeleton h-16 rounded-2xl"></div>
              <div class="skeleton h-16 rounded-2xl"></div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>
