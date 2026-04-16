<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AccountTabs from '../components/AccountTabs.vue'
import { getMyReferralDashboard, regenerateMyReferralCode } from '../services/referralApi'
import { useAuthStore } from '../stores/authStore'

const auth = useAuthStore()

const loading = ref(true)
const regenerating = ref(false)
const error = ref('')
const success = ref('')
const dashboard = ref(null)

const rankLabel = computed(
  () => dashboard.value?.current_reward?.rank_name || dashboard.value?.current_reward?.rank || 'Без ранга',
)

const recentItems = computed(() => {
  if (Array.isArray(dashboard.value?.recent_registrations)) return dashboard.value.recent_registrations
  if (Array.isArray(dashboard.value?.recent_events)) return dashboard.value.recent_events
  return []
})

const inviteLink = computed(() => dashboard.value?.my_code?.invite_url || '')
const currentCode = computed(() => dashboard.value?.my_code?.code || '—')

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function badgeClass(status) {
  if (status === 'qualified') return 'badge badge-success'
  if (status === 'pending') return 'badge badge-warning'
  return 'badge badge-ghost'
}

async function loadDashboard() {
  loading.value = true
  error.value = ''

  try {
    dashboard.value = await getMyReferralDashboard(auth.accessToken)
  } catch (err) {
    error.value = err?.message || 'Не удалось загрузить реферальный центр.'
  } finally {
    loading.value = false
  }
}

async function regenerateCode() {
  regenerating.value = true
  error.value = ''
  success.value = ''

  try {
    dashboard.value = await regenerateMyReferralCode(auth.accessToken)
    success.value = 'Новый реферальный код создан.'
  } catch (err) {
    error.value = err?.message || 'Не удалось сгенерировать новый код.'
  } finally {
    regenerating.value = false
  }
}

async function copyInviteUrl() {
  try {
    await navigator.clipboard.writeText(inviteLink.value || '')
    success.value = 'Ссылка приглашения скопирована.'
    error.value = ''
  } catch {
    error.value = 'Не удалось скопировать ссылку.'
  }
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText(currentCode.value || '')
    success.value = 'Код приглашения скопирован.'
    error.value = ''
  } catch {
    error.value = 'Не удалось скопировать код.'
  }
}

onMounted(loadDashboard)
</script>

<template>
  <section class="py-8 md:py-10">
    <div class="container-shell space-y-5">
      <section class="surface-card p-5 md:p-7">
        <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div class="section-kicker !mb-2">Реферальный центр</div>
            <h1 class="text-2xl font-black tracking-tight text-slate-50 md:text-4xl">
              Приглашай игроков без лишней путаницы
            </h1>
            <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-400 md:text-[15px]">
              Здесь твой код приглашения, прогресс и недавние регистрации. Всё собрано компактно и по делу.
            </p>
          </div>

          <RouterLink to="/profile/public" class="btn btn-outline">
            Публичный профиль
          </RouterLink>
        </div>
      </section>

      <AccountTabs />

      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="success" class="alert alert-success">{{ success }}</div>

      <div v-if="loading" class="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div class="skeleton h-[260px] rounded-[28px]"></div>
        <div class="skeleton h-[260px] rounded-[28px]"></div>
      </div>

      <template v-else>
        <div class="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Твой код</div>
            <h2 class="text-xl font-black tracking-tight text-slate-50 md:text-2xl">
              Личная ссылка приглашения
            </h2>

            <div class="action-card mt-5">
              <p class="metric-label">Referral code</p>
              <p class="mt-2 break-all text-3xl font-black tracking-[0.12em] text-slate-50">
                {{ currentCode }}
              </p>
              <p class="mt-4 break-all text-sm leading-6 text-slate-400">
                {{ inviteLink || '—' }}
              </p>
            </div>

            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <button class="btn btn-primary" @click="copyInviteUrl">Скопировать ссылку</button>
              <button class="btn btn-outline" @click="copyCode">Скопировать код</button>
              <button class="btn btn-ghost sm:col-span-2" :disabled="regenerating" @click="regenerateCode">
                <span v-if="regenerating" class="spinner"></span>
                <span>{{ regenerating ? 'Создаём...' : 'Сгенерировать новый код' }}</span>
              </button>
            </div>
          </section>

          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Прогресс</div>
            <h2 class="text-xl font-black tracking-tight text-slate-50 md:text-2xl">
              Текущее состояние
            </h2>

            <div class="metric-grid metric-grid-3 mt-5">
              <div class="metric-card text-center">
                <p class="metric-label">Ожидают</p>
                <p class="metric-value">{{ dashboard?.totals?.pending || 0 }}</p>
              </div>
              <div class="metric-card text-center">
                <p class="metric-label">Засчитано</p>
                <p class="metric-value">{{ dashboard?.totals?.qualified || 0 }}</p>
              </div>
              <div class="metric-card text-center">
                <p class="metric-label">Ранг</p>
                <p class="metric-value !text-[1.2rem] md:!text-[1.5rem]">{{ rankLabel }}</p>
              </div>
            </div>

            <div class="action-card mt-5 text-sm text-slate-300">
              Чем больше приглашённых игроков дойдут до нужного статуса, тем выше твой ранг и ценность реферального центра.
            </div>
          </section>
        </div>

        <section class="surface-card p-5 md:p-6">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div class="section-kicker !mb-2">История</div>
              <h2 class="text-xl font-black tracking-tight text-slate-50 md:text-2xl">
                Недавние регистрации
              </h2>
            </div>
            <span class="footer-chip">Всего событий: {{ recentItems.length }}</span>
          </div>

          <div v-if="!recentItems.length" class="action-card mt-5 text-sm text-slate-400">
            Пока приглашённых регистраций нет.
          </div>

          <div v-else class="mt-5 grid gap-3 lg:grid-cols-2">
            <article
              v-for="item in recentItems"
              :key="item.id || item.player_id || item.created_at"
              class="action-card"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="font-semibold text-slate-100">
                    {{
                      item.display_name ||
                      item.minecraft_nickname ||
                      item.site_login ||
                      item.player_name ||
                      'Игрок'
                    }}
                  </div>
                  <div class="mt-1 text-sm text-slate-400">
                    {{ item.email || item.player_account_id || '—' }}
                  </div>
                </div>
                <span :class="badgeClass(item.status)">
                  {{ item.status || 'unknown' }}
                </span>
              </div>

              <div class="mt-4 grid gap-2 text-sm text-slate-400">
                <div>Дата: {{ formatDate(item.created_at || item.registered_at) }}</div>
                <div>Награда: {{ item.reward_name || item.reward || '—' }}</div>
              </div>
            </article>
          </div>
        </section>
      </template>
    </div>
  </section>
</template>
