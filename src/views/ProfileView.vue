<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  reloadMe,
  revokeOtherSessionsForCurrentAccount,
  useAuthStore,
} from '../stores/authStore'

const auth = useAuthStore()

const errorMessage = ref('')
const successMessage = ref('')
const loading = ref(false)
const revokingSessions = ref(false)

const createdAtText = computed(() => {
  const raw = auth.state.user?.created_at
  if (!raw) return '—'

  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw

  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
})

const accountModeChipClass = computed(() => {
  return auth.mustUseLauncher.value
    ? 'border-sky-200 bg-sky-50 text-sky-800'
    : 'border-emerald-200 bg-emerald-50 text-emerald-800'
})

async function loadProfile() {
  loading.value = true
  errorMessage.value = ''

  try {
    await reloadMe()
  } catch (error) {
    errorMessage.value = error.message || 'Не удалось загрузить профиль.'
  } finally {
    loading.value = false
  }
}

async function revokeOtherSessions() {
  revokingSessions.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await revokeOtherSessionsForCurrentAccount()
    successMessage.value =
      response?.revoked_sessions > 0
        ? `Другие активные сессии завершены: ${response.revoked_sessions}.`
        : 'Других активных сессий не найдено.'
  } catch (error) {
    errorMessage.value = error.message || 'Не удалось завершить другие сессии.'
  } finally {
    revokingSessions.value = false
  }
}

onMounted(async () => {
  await loadProfile()
})
</script>

<template>
  <section class="py-16 md:py-24">
    <div class="container-shell">
      <div class="max-w-4xl">
        <div class="section-kicker">Мой профиль</div>
        <h1 class="section-title">Привет, {{ auth.displayName.value }}</h1>
        <p class="section-subtitle">
          Здесь собраны данные по аккаунту, режиму входа и активным сессиям. Это уже не заглушка, а рабочий кабинет безопасности аккаунта.
        </p>
      </div>

      <div
        v-if="!auth.emailVerified.value"
        class="mt-8 rounded-[28px] border border-amber-200 bg-amber-50 px-6 py-5 text-sm leading-7 text-amber-900"
      >
        Почта пока не подтверждена. Аккаунт уже работает, но лучше завершить этот шаг заранее.
        <RouterLink to="/verify-email" class="ml-2 font-semibold text-primary">Подтвердить почту</RouterLink>
      </div>

      <p
        v-if="errorMessage"
        class="mt-8 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
      >
        {{ errorMessage }}
      </p>

      <p
        v-if="successMessage"
        class="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
      >
        {{ successMessage }}
      </p>

      <div class="mt-10 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div class="glass-card rounded-[32px] p-8">
          <div class="section-kicker">Данные аккаунта</div>

          <div class="mt-6 grid gap-4">
            <div class="build-info-card">
              <p class="build-info-card__label">Логин</p>
              <p class="build-info-card__value">{{ auth.state.user?.site_login || '—' }}</p>
            </div>

            <div class="build-info-card">
              <p class="build-info-card__label">Email</p>
              <p class="build-info-card__value">{{ auth.state.user?.email || '—' }}</p>
            </div>

            <div class="build-info-card">
              <p class="build-info-card__label">Почта</p>
              <p class="build-info-card__value">
                {{ auth.emailVerified.value ? 'Подтверждена' : 'Не подтверждена' }}
              </p>
            </div>

            <div class="build-info-card">
              <p class="build-info-card__label">Игровой ник</p>
              <p class="build-info-card__value">
                {{ auth.state.playerAccount?.minecraft_nickname || '—' }}
              </p>
            </div>

            <div class="build-info-card">
              <p class="build-info-card__label">Ник привязан</p>
              <p class="build-info-card__value">
                {{ auth.nicknameLocked.value ? 'Да' : 'Нет' }}
              </p>
            </div>

            <div class="build-info-card">
              <p class="build-info-card__label">Дата создания аккаунта</p>
              <p class="build-info-card__value">{{ createdAtText }}</p>
            </div>
          </div>

          <div class="mt-6 flex flex-wrap gap-3">
            <RouterLink to="/download-launcher" class="btn btn-primary rounded-2xl">
              Скачать лаунчер
            </RouterLink>

            <RouterLink
              v-if="!auth.emailVerified.value"
              to="/verify-email"
              class="btn btn-outline rounded-2xl"
            >
              Подтвердить почту
            </RouterLink>

            <RouterLink to="/forgot-password" class="btn btn-ghost rounded-2xl">
              Сменить пароль
            </RouterLink>
          </div>
        </div>

        <div class="glass-card rounded-[32px] p-8">
          <div class="section-kicker">Безопасность и вход</div>

          <div class="mt-6 flex flex-wrap gap-3">
            <div
              class="rounded-full border px-4 py-2 text-sm font-semibold"
              :class="accountModeChipClass"
            >
              {{ auth.accountModeText.value }}
            </div>

            <div class="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
              Активные сессии: {{ auth.activeSessions.value }}
            </div>

            <div
              class="rounded-full border px-4 py-2 text-sm font-semibold"
              :class="auth.legacyReady.value ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-700'"
            >
              {{ auth.legacyReady.value ? 'Legacy ready' : 'Legacy not ready' }}
            </div>
          </div>

          <div class="mt-6 space-y-4">
            <div class="advantage-row">
              <div class="advantage-row__icon">01</div>
              <div>
                <p class="font-bold text-slate-900">Режим входа</p>
                <p class="mt-1 text-slate-600">
                  <template v-if="auth.mustUseLauncher.value">
                    Для этого аккаунта основной путь входа — только через официальный лаунчер.
                  </template>
                  <template v-else-if="auth.legacyAuthEnabled.value">
                    Для аккаунта активирован смешанный режим: можно использовать лаунчер и legacy-вход.
                  </template>
                  <template v-else>
                    Режим входа ещё не определён.
                  </template>
                </p>
              </div>
            </div>

            <div class="advantage-row">
              <div class="advantage-row__icon">02</div>
              <div>
                <p class="font-bold text-slate-900">Legacy hash</p>
                <p class="mt-1 text-slate-600">
                  {{
                    auth.legacyHashPresent.value
                      ? 'Для аккаунта в базе присутствует legacy hash.'
                      : 'Legacy hash для аккаунта отсутствует.'
                  }}
                </p>
              </div>
            </div>

            <div class="advantage-row">
              <div class="advantage-row__icon">03</div>
              <div>
                <p class="font-bold text-slate-900">Активные сессии</p>
                <p class="mt-1 text-slate-600">
                  Если есть лишние входы на других устройствах, их можно завершить одним действием, не разлогинивая текущую сессию.
                </p>
              </div>
            </div>
          </div>

          <div class="mt-8 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p class="text-sm font-semibold text-slate-900">Управление сессиями</p>
            <p class="mt-2 text-sm leading-7 text-slate-600">
              Эта кнопка завершит все другие активные refresh-сессии, но оставит текущую сессию на сайте рабочей.
            </p>

            <div class="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                class="btn btn-outline rounded-2xl"
                :disabled="revokingSessions || loading"
                @click="revokeOtherSessions"
              >
                {{ revokingSessions ? 'Завершаем...' : 'Завершить другие сессии' }}
              </button>

              <button
                type="button"
                class="btn btn-ghost rounded-2xl"
                :disabled="loading"
                @click="loadProfile"
              >
                {{ loading ? 'Обновляем...' : 'Обновить профиль' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>