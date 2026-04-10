<script setup>
import { computed, onMounted, ref } from 'vue'
import { getMyNation } from '../services/nationsApi'
import { getMyPublicProfile } from '../services/profileApi'
import AccountTabs from '../components/AccountTabs.vue'
import { reloadMe, useAuthStore } from '../stores/authStore'

const auth = useAuthStore()
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const publicProfileError = ref('')
const myNationError = ref('')
const publicProfile = ref(null)
const myNation = ref(null)

const avatarUrl = computed(() => publicProfile.value?.assets?.avatar_url || publicProfile.value?.assets?.avatar_preview_url || '')
const avatarText = computed(() => (publicProfile.value?.display_name || auth.displayName.value || 'U').slice(0, 1).toUpperCase())
const createdAtText = computed(() => {
  const raw = auth.state.user?.created_at
  if (!raw) return '—'
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' }).format(date)
})
const publicProfileLink = computed(() => (publicProfile.value?.slug ? `/u/${publicProfile.value.slug}` : ''))
const myNationLink = computed(() => (myNation.value?.slug ? `/nation/${myNation.value.slug}` : ''))

async function loadPublicProfileSummary() {
  publicProfileError.value = ''
  try {
    if (!auth.accessToken) {
      publicProfile.value = null
      return
    }
    publicProfile.value = await getMyPublicProfile(auth.accessToken)
  } catch (error) {
    publicProfileError.value = error.message || 'Не удалось загрузить публичный профиль.'
  }
}

async function loadMyNation() {
  myNationError.value = ''
  try {
    if (!auth.accessToken) {
      myNation.value = null
      return
    }
    myNation.value = await getMyNation(auth.accessToken)
  } catch (error) {
    myNationError.value = error.message || 'Не удалось загрузить государство.'
  }
}

async function refreshAccount() {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await reloadMe()
    await Promise.all([loadPublicProfileSummary(), loadMyNation()])
    successMessage.value = 'Данные кабинета обновлены.'
  } catch (error) {
    errorMessage.value = error.message || 'Не удалось обновить данные.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadPublicProfileSummary(), loadMyNation()])
})
</script>

<template>
  <section class="py-6 md:py-8">
    <div class="container-shell space-y-4">
      <section class="surface-card p-4 md:p-6">
        <div class="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div class="flex min-w-0 items-center gap-4">
            <div class="preview-avatar h-20 w-20 border border-white/10 text-2xl uppercase shadow-sm md:h-24 md:w-24 md:text-3xl">
              <img v-if="avatarUrl" :src="avatarUrl" alt="avatar" class="h-full w-full object-cover" />
              <span v-else>{{ avatarText }}</span>
            </div>

            <div class="min-w-0">
              <div class="section-kicker !mb-2">Личный кабинет</div>
              <h1 class="truncate text-2xl font-black tracking-tight text-slate-50 md:text-3xl">
                {{ publicProfile?.display_name || auth.displayName.value }}
              </h1>
              <p class="mt-2 text-sm text-slate-300">{{ auth.state.user?.email || 'Почта не указана' }}</p>
              <p class="mt-1 text-sm text-slate-500">Minecraft: {{ auth.state.playerAccount?.minecraft_nickname || '—' }}</p>

              <div v-if="myNation?.slug" class="mt-3 flex flex-wrap gap-2">
                <RouterLink :to="myNationLink" class="footer-chip">
                  <span>[{{ myNation.tag }}]</span>
                  <span class="max-w-[220px] truncate normal-case tracking-normal text-sm font-semibold">{{ myNation.title }}</span>
                </RouterLink>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <RouterLink to="/profile/public" class="btn btn-primary btn-sm rounded-2xl">Настроить профиль</RouterLink>
            <RouterLink v-if="publicProfile?.slug" :to="publicProfileLink" class="btn btn-outline btn-sm rounded-2xl">Открыть страницу</RouterLink>
            <button type="button" class="btn btn-ghost btn-sm rounded-2xl" :disabled="loading" @click="refreshAccount">
              <span v-if="loading" class="spinner"></span>
              <span>{{ loading ? 'Обновляем...' : 'Обновить' }}</span>
            </button>
          </div>
        </div>

        <p v-if="errorMessage" class="alert alert-error mt-4">{{ errorMessage }}</p>
        <p v-if="successMessage" class="alert alert-success mt-4">{{ successMessage }}</p>
        <p v-if="publicProfileError" class="alert alert-warn mt-4">{{ publicProfileError }}</p>
        <p v-if="myNationError" class="alert alert-warn mt-4">{{ myNationError }}</p>
      </section>

      <AccountTabs />

      <div class="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <section class="surface-card p-4 md:p-5">
          <div class="section-kicker !mb-2">Главное</div>
          <h2 class="text-xl font-black text-slate-50 md:text-2xl">Коротко об аккаунте</h2>
          <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            Всё нужное для игрока в одном месте: аккаунт, публичная страница и текущее государство без лишнего мусора.
          </p>

          <div class="metric-grid metric-grid-2 mt-4">
            <div class="metric-card">
              <p class="metric-label">Логин</p>
              <p class="mt-2 break-all text-sm font-semibold text-slate-100">{{ auth.state.user?.site_login || '—' }}</p>
            </div>

            <div class="metric-card">
              <p class="metric-label">Дата регистрации</p>
              <p class="mt-2 text-sm font-semibold text-slate-100">{{ createdAtText }}</p>
            </div>

            <div class="metric-card">
              <p class="metric-label">Email подтверждён</p>
              <p class="mt-2 text-sm font-semibold text-slate-100">{{ auth.emailVerified.value ? 'Да' : 'Нет' }}</p>
            </div>

            <div class="metric-card">
              <p class="metric-label">Публичный профиль</p>
              <p class="mt-2 text-sm font-semibold text-slate-100">{{ publicProfile?.is_public ? 'Открыт' : 'Скрыт' }}</p>
            </div>
          </div>

          <div class="action-card mt-4">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div class="min-w-0">
                <p class="metric-label">Страница игрока</p>
                <h3 class="mt-2 text-lg font-black text-slate-50">
                  {{ publicProfile?.status_text || 'Добавь короткий статус, чтобы профиль выглядел живее.' }}
                </h3>
                <p class="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
                  {{ publicProfile?.bio || 'Описание ещё не заполнено. Можно добавить баннер, фон страницы, аватар и рассказ о себе.' }}
                </p>
              </div>

              <RouterLink to="/profile/public" class="btn btn-outline btn-sm rounded-2xl lg:self-start">Редактировать</RouterLink>
            </div>
          </div>
        </section>

        <div class="space-y-4">
          <section class="surface-card p-4 md:p-5">
            <div class="section-kicker !mb-2">Государство</div>
            <h2 class="text-xl font-black text-slate-50">Место игрока в мире</h2>

            <RouterLink
              v-if="myNation?.slug"
              :to="myNationLink"
              class="action-card mt-4 block transition"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="metric-label">Текущее государство</p>
                  <h3 class="mt-2 truncate text-lg font-black text-slate-50">{{ myNation.title }}</h3>
                  <p class="mt-1 text-sm leading-6 text-slate-400">[{{ myNation.tag }}] · {{ myNation.short_description || 'Публичная страница уже доступна.' }}</p>
                </div>
                <span class="badge badge-success">Участник</span>
              </div>
            </RouterLink>

            <div v-else class="action-card mt-4 text-sm leading-7 text-slate-400">
              Ты пока не состоишь в государстве. Можно создать своё или вступить в уже существующее.
            </div>
          </section>

          <section class="surface-card p-4 md:p-5">
            <div class="section-kicker !mb-2">Переходы</div>
            <h2 class="text-xl font-black text-slate-50">Что можно сделать</h2>

            <div class="mt-4 grid gap-3">
              <RouterLink to="/profile/public" class="action-card transition">
                <p class="font-semibold text-slate-100">Настроить внешний вид профиля</p>
                <p class="mt-1 text-sm leading-6 text-slate-400">Имя, статус, описание, баннер, аватар и фон страницы.</p>
              </RouterLink>

              <RouterLink :to="myNation ? '/nation/studio' : '/nations'" class="action-card transition">
                <p class="font-semibold text-slate-100">{{ myNation ? 'Управлять государством' : 'Перейти к государствам' }}</p>
                <p class="mt-1 text-sm leading-6 text-slate-400">{{ myNation ? 'Государство осталось внутри профиля, а не в навбаре.' : 'Можно создать своё государство или вступить в существующее.' }}</p>
              </RouterLink>

              <RouterLink to="/download-launcher" class="action-card transition">
                <p class="font-semibold text-slate-100">Скачать лаунчер</p>
                <p class="mt-1 text-sm leading-6 text-slate-400">Основной путь входа на сервер без лишней ручной настройки.</p>
              </RouterLink>

              <RouterLink to="/profile/social" class="action-card transition">
                <p class="font-semibold text-slate-100">Друзья и подписки</p>
                <p class="mt-1 text-sm leading-6 text-slate-400">Социальный блок вынесен отдельно, чтобы кабинет оставался чистым.</p>
              </RouterLink>
            </div>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>
