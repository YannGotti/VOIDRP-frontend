<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AccountTabs from '../components/AccountTabs.vue'
import { getMyNation } from '../services/nationsApi'
import { getMyPublicProfile } from '../services/profileApi'
import { reloadMe, useAuthStore } from '../stores/authStore'

const auth = useAuthStore()

const loading = ref(true)
const refreshing = ref(false)
const errorMessage = ref('')
const publicProfile = ref(null)
const myNation = ref(null)

const displayName = computed(() => auth.displayName.value || 'Игрок')

const avatarText = computed(() => {
  const source =
    publicProfile.value?.display_name ||
    auth.state.playerAccount?.minecraft_nickname ||
    auth.state.user?.site_login ||
    'V'

  return source.slice(0, 1).toUpperCase()
})

const avatarUrl = computed(
  () => publicProfile.value?.assets?.avatar_url || publicProfile.value?.assets?.avatar_preview_url || '',
)

const publicProfileUrl = computed(() => (publicProfile.value?.slug ? `/u/${publicProfile.value.slug}` : ''))

const createdAtText = computed(() => {
  const raw = auth.state.user?.created_at
  if (!raw) return '—'

  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw

  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' }).format(date)
})

const bioText = computed(() => {
  return publicProfile.value?.bio?.trim() || 'Добавь короткое описание о себе, чтобы профиль выглядел живым и законченным.'
})

const profileStateText = computed(() => {
  return publicProfile.value?.slug ? 'Публичный профиль уже доступен игрокам' : 'Публичный профиль ещё не заполнен'
})

const checkpoints = computed(() => [
  {
    label: 'Почта',
    value: auth.emailVerified.value ? 'Подтверждена' : 'Нужно подтвердить',
    done: auth.emailVerified.value,
  },
  {
    label: 'Игровой ник',
    value: auth.state.playerAccount?.minecraft_nickname || 'Пока не указан',
    done: Boolean(auth.state.playerAccount?.minecraft_nickname),
  },
  {
    label: 'Публичный профиль',
    value: publicProfile.value?.slug ? `@${publicProfile.value.slug}` : 'Пока не заполнен',
    done: Boolean(publicProfile.value?.slug),
  },
])

const quickLinks = computed(() => [
  {
    title: 'Редактировать публичный профиль',
    description: 'Сменить описание, внешний вид и ссылки профиля.',
    to: '/profile/public',
  },
  {
    title: 'Реферальный центр',
    description: 'Смотреть код приглашения и активность приглашённых игроков.',
    to: '/profile/referrals',
  },
  {
    title: 'Друзья и подписки',
    description: 'Открыть социальный блок без лишней перегрузки кабинета.',
    to: '/profile/social',
  },
  {
    title: myNation.value ? 'Управлять государством' : 'Перейти к государствам',
    description: myNation.value
      ? `Сейчас ты состоишь в «${myNation.value.title}».`
      : 'Можно создать своё государство или вступить в существующее.',
    to: myNation.value ? '/nation/studio' : '/nations',
  },
])

async function loadData() {
  errorMessage.value = ''
  loading.value = true

  try {
    await reloadMe()

    const [profilePayload, nationPayload] = await Promise.all([
      auth.accessToken ? getMyPublicProfile(auth.accessToken) : Promise.resolve(null),
      auth.accessToken ? getMyNation(auth.accessToken) : Promise.resolve(null),
    ])

    publicProfile.value = profilePayload || null
    myNation.value = nationPayload || null
  } catch (error) {
    errorMessage.value = error.message || 'Не удалось загрузить кабинет.'
  } finally {
    loading.value = false
  }
}

async function refreshAccount() {
  refreshing.value = true
  await loadData()
  refreshing.value = false
}

onMounted(loadData)
</script>

<template>
  <section class="py-8 md:py-10">
    <div class="container-shell space-y-6">
      <div v-if="errorMessage" class="alert alert-error">
        {{ errorMessage }}
      </div>

      <section class="surface-card p-5 md:p-7 lg:p-8">
        <div class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div class="flex min-w-0 gap-4 md:gap-5">
            <div class="preview-avatar h-20 w-20 shrink-0 text-2xl md:h-24 md:w-24 md:text-3xl">
              <img v-if="avatarUrl" :src="avatarUrl" :alt="displayName" class="h-full w-full object-cover" />
              <span v-else>{{ avatarText }}</span>
            </div>

            <div class="min-w-0">
              <div class="section-kicker !mb-2">Кабинет игрока</div>
              <h1 class="truncate text-3xl font-black tracking-tight text-slate-50 md:text-4xl">
                {{ displayName }}
              </h1>
              <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-400 md:text-[15px]">
                Чистый обзор аккаунта без лишних технических деталей. Всё важное для игрока
                собрано в одном месте: профиль, состояние аккаунта и быстрые переходы.
              </p>

              <div class="mt-4 flex flex-wrap gap-2.5">
                <span class="footer-chip">{{ auth.accountModeText.value }}</span>
                <span class="footer-chip">{{ profileStateText }}</span>
                <span class="footer-chip">Аккаунт создан: {{ createdAtText }}</span>
              </div>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <button type="button" class="btn btn-outline" :disabled="refreshing" @click="refreshAccount">
              <span v-if="refreshing" class="spinner"></span>
              <span>{{ refreshing ? 'Обновляем...' : 'Обновить данные' }}</span>
            </button>

            <RouterLink v-if="publicProfileUrl" :to="publicProfileUrl" class="btn btn-primary">
              Открыть публичный профиль
            </RouterLink>
            <RouterLink v-else to="/profile/public" class="btn btn-primary">
              Заполнить профиль
            </RouterLink>
          </div>
        </div>
      </section>

      <AccountTabs />

      <div v-if="loading" class="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div class="space-y-4">
          <div class="skeleton h-44 rounded-[28px]"></div>
          <div class="skeleton h-52 rounded-[28px]"></div>
        </div>
        <div class="space-y-4">
          <div class="skeleton h-52 rounded-[28px]"></div>
          <div class="skeleton h-44 rounded-[28px]"></div>
        </div>
      </div>

      <div v-else class="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div class="space-y-4">
          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Профиль</div>
            <h2 class="text-xl font-black tracking-tight text-slate-50 md:text-2xl">
              О себе
            </h2>
            <p class="mt-4 whitespace-pre-line text-sm leading-7 text-slate-300">
              {{ bioText }}
            </p>

            <div class="mt-5 grid gap-3 sm:grid-cols-3">
              <div
                v-for="item in checkpoints"
                :key="item.label"
                class="metric-card"
              >
                <div class="flex items-center justify-between gap-3">
                  <p class="metric-label">{{ item.label }}</p>
                  <span class="h-2.5 w-2.5 rounded-full" :class="item.done ? 'bg-emerald-400' : 'bg-amber-400'"></span>
                </div>
                <p class="mt-3 text-sm font-semibold text-slate-100">
                  {{ item.value }}
                </p>
              </div>
            </div>
          </section>

          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Переходы</div>
            <h2 class="text-xl font-black tracking-tight text-slate-50 md:text-2xl">
              Быстрые действия
            </h2>

            <div class="mt-5 grid gap-3">
              <RouterLink
                v-for="item in quickLinks"
                :key="item.to"
                :to="item.to"
                class="action-card transition hover:-translate-y-[1px]"
              >
                <p class="font-semibold text-slate-100">{{ item.title }}</p>
                <p class="mt-2 text-sm leading-6 text-slate-400">{{ item.description }}</p>
              </RouterLink>
            </div>
          </section>
        </div>

        <div class="space-y-4">
          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Аккаунт</div>
            <h2 class="text-xl font-black tracking-tight text-slate-50 md:text-2xl">
              Основная информация
            </h2>

            <div class="mt-5 grid gap-3">
              <div class="action-card">
                <p class="metric-label">Логин</p>
                <p class="mt-2 text-sm font-semibold text-slate-100">{{ auth.state.user?.site_login || '—' }}</p>
              </div>

              <div class="action-card">
                <p class="metric-label">Email</p>
                <p class="mt-2 break-all text-sm font-semibold text-slate-100">{{ auth.state.user?.email || '—' }}</p>
              </div>

              <div class="action-card">
                <p class="metric-label">Игровой ник</p>
                <p class="mt-2 text-sm font-semibold text-slate-100">
                  {{ auth.state.playerAccount?.minecraft_nickname || 'Пока не указан' }}
                </p>
              </div>
            </div>
          </section>

          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Государство</div>
            <h2 class="text-xl font-black tracking-tight text-slate-50 md:text-2xl">
              Твой статус в мире
            </h2>

            <div v-if="myNation" class="mt-5 space-y-3">
              <div class="action-card">
                <p class="metric-label">Название</p>
                <p class="mt-2 text-sm font-semibold text-slate-100">{{ myNation.title }}</p>
                <p class="mt-2 text-sm leading-6 text-slate-400">
                  [{{ myNation.tag }}] · {{ myNation.short_description || 'Описание пока не добавлено.' }}
                </p>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <RouterLink to="/nation/studio" class="btn btn-primary">Открыть управление</RouterLink>
                <RouterLink :to="`/nation/${myNation.slug}`" class="btn btn-outline">Публичная страница</RouterLink>
              </div>
            </div>

            <div v-else class="mt-5">
              <div class="action-card">
                <p class="text-sm leading-7 text-slate-300">
                  Ты пока не состоишь в государстве. Можно вступить в существующее или
                  создать своё сообщество со страницей, рейтингом и оформлением.
                </p>
              </div>

              <div class="mt-3 grid gap-3 sm:grid-cols-2">
                <RouterLink to="/nations" class="btn btn-outline">Открыть список</RouterLink>
                <RouterLink to="/nation/studio" class="btn btn-primary">Создать своё</RouterLink>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>
